const router = require("express").Router();
const pool = require("../../config/database");

//Get Products
const getAllProductRouter = router.get("/", async (req, res, next) => {
  try {
    const connection = await pool.promise().getConnection();

    let sqlGetProducts = `SELECT *, p.id FROM products p
    INNER JOIN products_categories pc ON p.id = pc.product_id
    INNER JOIN categories c ON pc.category_id = c.id
    INNER JOIN stocks s ON pc.product_id = s.product_id
    LIMIT ${req.query.limit} OFFSET ${req.query.offSet}`;

    const getTotalProducts = `SELECT COUNT(id) AS total FROM products`;

    if (req.query.sortBy && req.query.order) {
      sqlGetProducts = `SELECT *, p.id FROM products p
      INNER JOIN products_categories pc ON p.id = pc.product_id
      INNER JOIN categories c ON pc.category_id = c.id
      INNER JOIN stocks s ON pc.product_id = s.product_id
      ORDER BY p.${req.query.sortBy} ${req.query.order}
      LIMIT ${req.query.limit} OFFSET ${req.query.offSet};`;
    }
    const [result] = await connection.query(sqlGetProducts);
    const [resultTotal] = await connection.query(getTotalProducts);
    connection.release();
    res.status(200).send({ result, total: resultTotal[0].total });
  } catch (error) {
    next(error);
  }
});

//Get Products By Category
const getProductsByCategoryRouter = router.get(
  "/category/:category",
  async (req, res, next) => {
    try {
      const connection = await pool.promise().getConnection();
      let sqlGetProductsByCategory = `SELECT products.id, products.productName, categories.name AS category, products.price, products.productPhoto, products.dose, name, stocks.isLiquid
      FROM (((products_categories
      INNER JOIN products ON products_categories.product_id = products.id)
      INNER JOIN categories ON products_categories.category_id  = categories.id)
      INNER JOIN stocks ON products_categories.product_id = stocks.product_id)
      WHERE categories.name = ?
      LIMIT ${req.query.limit} OFFSET ${req.query.offSet}`;

      const getTotalProducts = `SELECT COUNT(products.id) AS total
      FROM ((products_categories
      INNER JOIN products ON products_categories.product_id = products.id)
      INNER JOIN categories ON products_categories.category_id  = categories.id)
      WHERE categories.name = ?;`;
      const dataCategory = req.params.category;

      if (req.query.sortBy && req.query.order) {
        sqlGetProductsByCategory = `SELECT products.id, products.productName, categories.name AS category, products.price, products.productPhoto, products.dose, name, stocks.isLiquid
        FROM (((products_categories
        INNER JOIN products ON products_categories.product_id = products.id)
        INNER JOIN categories ON products_categories.category_id  = categories.id)
        INNER JOIN stocks ON products_categories.product_id = stocks.product_id)
        WHERE categories.name = ?
        ORDER BY products.${req.query.sortBy} ${req.query.order}
        LIMIT ${req.query.limit} OFFSET ${req.query.offSet};`;
      }
      const [result] = await connection.query(
        sqlGetProductsByCategory,
        dataCategory
      );
      const [resultTotal] = await connection.query(
        getTotalProducts,
        dataCategory
      );
      connection.release();
      res.status(200).send({ result, total: resultTotal[0].total });
    } catch (error) {
      next(error);
    }
  }
);

//Get Product By Id
const getProductsByIdRouter = router.get(
  "/:category/:id",
  async (req, res, next) => {
    try {
      const connection = await pool.promise().getConnection();

      const sqlGetProductsByCategory = `SELECT *, products.id FROM (((products
      INNER JOIN products_categories ON products_categories.product_id = products.id)
      INNER JOIN categories ON products_categories.category_id  = categories.id)
      INNER JOIN stocks ON products_categories.product_id = stocks.product_id)
      WHERE products.id = ?;`;
      const dataId = req.params.id;
      const [result] = await connection.query(sqlGetProductsByCategory, dataId);

      const sqlGetSimilarProducts = `SELECT p.id, productName, price, productPhoto, dose, name, SUM(boxSold + stripSold + pcsSold + mgSold) AS totalSold
    FROM products p
    INNER JOIN products_categories pc ON p.id = pc.product_id
    INNER JOIN categories c ON pc.category_id = c.id
    INNER JOIN stocks s ON s.product_id = p.id
    WHERE c.name = ?
    GROUP BY p.id ORDER BY totalSold DESC LIMIT 5;`;
      const dataSimilarProducts = req.params.category;
      const [resultSimilar] = await connection.query(
        sqlGetSimilarProducts,
        dataSimilarProducts
      );
      connection.release();
      res.status(200).send({ result, resultSimilar });
    } catch (error) {
      next(error);
    }
  }
);

//Get Products by Name
const getProductsByNameRouter = router.get(
  "/search",
  async (req, res, next) => {
    try {
      const connection = await pool.promise().getConnection();
      const data = req.query.search;
      const sqlGetProductsByName = `SELECT * FROM products WHERE productName LIKE ?;`;
      const dataGetProducts = "%" + data + "%";
      const result = await connection.query(
        sqlGetProductsByName,
        dataGetProducts
      );
      connection.release();
      res.status(200).send(result);
    } catch (error) {
      next(error);
    }
  }
);

module.exports = {
  getAllProductRouter,
  getProductsByCategoryRouter,
  getProductsByNameRouter,
  getProductsByIdRouter,
};
