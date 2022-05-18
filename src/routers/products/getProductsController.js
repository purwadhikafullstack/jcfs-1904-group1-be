const router = require("express").Router();
const pool = require("../../config/database");
const connection = await pool.promise().getConnection();

//Get Categories
const getCategoriesRouter = router.get(
  "/categories",
  async (req, res, next) => {
    try {
      const sqlGetCategories = "SELECT name, id FROM categories";
      const result = await connection.query(sqlGetCategories);
      connection.release();

      res.status(200).send(result);
    } catch (error) {
      connection.release();
      next(error);
    }
  }
);
//Get Products
const getAllProductRouter = router.get("/", async (req, res, next) => {
  try {
    let sqlGetProducts = `SELECT *, p.id FROM products p
    INNER JOIN products_categories pc ON p.id = pc.product_id
    INNER JOIN categories c ON pc.category_id = c.id
    INNER JOIN stocks s ON pc.product_id = s.product_id
    WHERE p.isDeleted = 0`;

    const getTotalProducts = `SELECT COUNT(id) AS total FROM products WHERE isDeleted = 0`;

    if (req.query.sortBy && req.query.order) {
      sqlGetProducts += ` ORDER BY p.${req.query.sortBy} ${req.query.order}
      LIMIT ${req.query.limit} OFFSET ${req.query.offSet};`;
    } else {
      sqlGetProducts += ` LIMIT ${req.query.limit} OFFSET ${req.query.offSet};`;
    }

    const [result] = await connection.query(sqlGetProducts);
    const [resultTotal] = await connection.query(getTotalProducts);
    connection.release();
    res.status(200).send({ result, total: resultTotal[0].total });
  } catch (error) {
    connection.release();
    next(error);
  }
});

//Get Products By Category
const getProductsByCategoryRouter = router.get(
  "/category/:category",
  async (req, res, next) => {
    try {
      let sqlGetProductsByCategory = `SELECT products.id, products.productName, categories.name AS category, products.priceStrip, products.productPhoto, products.dose, name, stocks.isLiquid
      FROM (((products_categories
      INNER JOIN products ON products_categories.product_id = products.id)
      INNER JOIN categories ON products_categories.category_id  = categories.id)
      INNER JOIN stocks ON products_categories.product_id = stocks.product_id)
      WHERE categories.name = ? AND products.isDeleted = 0
      LIMIT ${req.query.limit} OFFSET ${req.query.offSet}`;

      const getTotalProducts = `SELECT COUNT(products.id) AS total
      FROM ((products_categories
      INNER JOIN products ON products_categories.product_id = products.id)
      INNER JOIN categories ON products_categories.category_id  = categories.id)
      WHERE categories.name = ?;`;
      const dataCategory = req.params.category;

      if (req.query.sortBy && req.query.order) {
        sqlGetProductsByCategory = `SELECT products.id, products.productName, categories.name AS category, products.priceStrip, products.productPhoto, products.dose, name, stocks.isLiquid
        FROM (((products_categories
        INNER JOIN products ON products_categories.product_id = products.id)
        INNER JOIN categories ON products_categories.category_id  = categories.id)
        INNER JOIN stocks ON products_categories.product_id = stocks.product_id)
        WHERE categories.name = ? AND products.isDeleted = 0
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
      connection.release();
      next(error);
    }
  }
);

//Get Product By Id
const getProductsByIdRouter = router.get(
  "/:category/:id",
  async (req, res, next) => {
    try {
      const sqlGetProductsByCategory = `SELECT *, products.id FROM (((products
      INNER JOIN products_categories ON products_categories.product_id = products.id)
      INNER JOIN categories ON products_categories.category_id  = categories.id)
      INNER JOIN stocks ON products_categories.product_id = stocks.product_id)
      WHERE products.id = ?;`;
      const dataId = req.params.id;
      const [result] = await connection.query(sqlGetProductsByCategory, dataId);

      const sqlGetSimilarProducts = `SELECT p.id, p.productName, p.priceStrip, p.productPhoto, p.dose, c.name, sum(dt.qty) as totalSold from detailTransaction dt 
      inner join transactions t on t.id = dt.transaction_id
      inner join products p on p.id = dt.product_id
      inner join products_categories pc on pc.product_id = p.id
      inner join categories c on pc.category_id = c.id
      where t.status = "complete" AND p.isDeleted = 0 AND c.name = ?
      group by p.productName
      order by totalSold desc limit 5;`;
      const dataSimilarProducts = req.params.category;
      const [resultSimilar] = await connection.query(
        sqlGetSimilarProducts,
        dataSimilarProducts
      );
      connection.release();
      res.status(200).send({ result, resultSimilar });
    } catch (error) {
      connection.release();
      next(error);
    }
  }
);

//Get Products by Name
const getProductsByNameRouter = router.get(
  "/search",
  async (req, res, next) => {
    try {
      const data = req.query.search;
      const sqlGetProductsByName = `SELECT * FROM products WHERE productName LIKE ? AND isDeleted = 0;`;
      const dataGetProducts = "%" + data + "%";
      const result = await connection.query(
        sqlGetProductsByName,
        dataGetProducts
      );
      connection.release();
      res.status(200).send(result);
    } catch (error) {
      connection.release();
      next(error);
    }
  }
);

const getAllProductAdminRouter = router.get(
  "/admin",
  async (req, res, next) => {
    try {
      let sqlGetProducts = `SELECT *, p.id FROM products p
    INNER JOIN products_categories pc ON p.id = pc.product_id
    INNER JOIN categories c ON pc.category_id = c.id
    INNER JOIN stocks s ON pc.product_id = s.product_id
    LIMIT ${req.query.limit} OFFSET ${req.query.offSet};`;

      const getTotalProducts = `SELECT COUNT(id) AS total FROM products`;

      const [result] = await connection.query(sqlGetProducts);
      const [resultTotal] = await connection.query(getTotalProducts);
      connection.release();
      res.status(200).send({ result, total: resultTotal[0].total });
    } catch (error) {
      connection.release();
      next(error);
    }
  }
);

const getMostWantedProductsRouter = router.get(
  "/wanted",
  async (req, res, next) => {
    try {
      const sqlGetSimilarProducts = `SELECT p.id, p.productName, p.priceStrip, p.productPhoto, p.dose, c.name, sum(dt.qty) as totalSold from detailTransaction dt 
      inner join transactions t on t.id = dt.transaction_id
      inner join products p on p.id = dt.product_id
      inner join products_categories pc on pc.product_id = p.id
      inner join categories c on pc.category_id = c.id
      where t.status = "complete" AND p.isDeleted = 0
      group by p.productName
      order by totalSold desc limit 5;`;

      const [bestSeller] = await connection.query(sqlGetSimilarProducts);
      connection.release();
      res.status(200).send({ bestSeller });
    } catch (error) {
      connection.release();
      next(error);
    }
  }
);

module.exports = {
  getAllProductRouter,
  getProductsByCategoryRouter,
  getProductsByNameRouter,
  getCategoriesRouter,
  getProductsByIdRouter,
  getAllProductAdminRouter,
  getMostWantedProductsRouter,
};
