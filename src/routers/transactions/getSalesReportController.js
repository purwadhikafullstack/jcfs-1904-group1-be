const router = require("express").Router();
const pool = require("../../config/database");
const moment = require("moment");

// REVENUE REPORT //

const getSalesReportRouter = router.get("/revenue", async (req, res, next) => {
  const connection = await pool.promise().getConnection();
  try {
    let sqlSalesReport = `SELECT t.id, t.invoice, u.username, t.amount, t.createdAt AS date FROM transactions t
    INNER JOIN users u ON t.user_id = u.id`;

    let sqlGetRevenue = `SELECT DATE_FORMAT(createdAt, '%Y') AS filter, SUM(amount) AS amount
    FROM transactions
    WHERE status = "complete"
    GROUP BY filter`;

    let sqlGetReportCount = `SELECT COUNT(t.id) AS total 
    FROM transactions t
    INNER JOIN users u ON t.user_id = u.id`;

    if (
      req.query.initMonth &&
      req.query.initYear &&
      req.query.finalMonth &&
      req.query.finalYear
    ) {
      const dataInitSql = req.query.initYear + "-" + req.query.initMonth;
      const dataFinalSql = req.query.finalYear + "-" + req.query.finalMonth;

      sqlSalesReport += ` WHERE t.status = "complete" AND DATE_FORMAT(t.createdAt, "%Y-%m") >= '${dataInitSql}' AND DATE_FORMAT(t.createdAt, "%Y-%m") <= "${dataFinalSql}"
      LIMIT ${req.query.limit} OFFSET ${req.query.offSet}`;

      sqlGetRevenue = `SELECT DATE_FORMAT(createdAt, '%b %Y') AS filter, SUM(amount) AS amount
      FROM transactions
      WHERE status = "complete" AND
      DATE_FORMAT(createdAt, "%Y-%m") >= "${dataInitSql}" AND DATE_FORMAT(createdAt, "%Y-%m") <= "${dataFinalSql}"
      GROUP BY filter;`;

      sqlGetReportCount += ` WHERE t.status = "complete" AND DATE_FORMAT(t.createdAt, "%Y-%m") >= '${dataInitSql}' AND DATE_FORMAT(t.createdAt, "%Y-%m") <= "${dataFinalSql}";`;
    } else {
      sqlSalesReport += ` WHERE t.status = "complete" ORDER BY date ASC
      LIMIT ${req.query.limit} OFFSET ${req.query.offSet};`;
    }
    const [results] = await connection.query(sqlSalesReport);
    const [revByMonth] = await connection.query(sqlGetRevenue);
    const [totalCount] = await connection.query(sqlGetReportCount);

    const dataChart = revByMonth.map((data) => {
      return {
        ...data,
        amount: parseInt(data.amount),
      };
    });
    const data = results.map((result) => {
      return {
        ...result,
        date: moment(result.date).format("DD MMM YYYY"),
      };
    });

    connection.release();
    res.status(200).send({ data, dataChart, totalCount });
  } catch (error) {
    connection.release();
    next(error);
  }
});

// PRODUCTS REPORT //

const getProductsReportRouter = router.get(
  `/products-report`,
  async (req, res, next) => {
    const connection = await pool.promise().getConnection();
    try {
      let sqlGetProductsReport = `SELECT dt.id, t.invoice, u.username, p.productName, dt.qty, dt.variant, DATE_FORMAT(dt.createdAt, "%Y-%m") AS date
      FROM detailtransaction dt
      INNER JOIN transactions t ON dt.transaction_id = t.id
      INNER JOIN users u ON t.user_id = u.id
      INNER JOIN products p ON dt.product_id = p.id
      WHERE t.status = "complete"`;

      let sqlGetProductsReportCount = `SELECT COUNT(dt.id) AS total
      FROM detailtransaction dt
      INNER JOIN transactions t ON dt.transaction_id = t.id
      INNER JOIN users u ON t.user_id = u.id
      INNER JOIN products p ON dt.product_id = p.id
      WHERE t.status = "complete"`;

      let sqlGetProductByCategory = `SELECT c.id, c.name, SUM(dt.qty) AS sold,  DATE_FORMAT(dt.createdAt, "%Y-%m") as date
      FROM detailtransaction dt 
      INNER JOIN transactions t ON dt.transaction_id = t.id
      INNER JOIN products p ON p.id = dt.product_id
      INNER JOIN products_categories pc ON p.id = pc.product_id
      INNER JOIN categories c ON pc.category_id = c.id
      WHERE t.status = "complete"`;

      let sqlGetProductsSalesByMonth = `SELECT dt.id, p.productName, SUM(dt.qty) AS sold, variant, DATE_FORMAT(dt.createdAt, "%Y %m") as date
      FROM detailtransaction dt 
      INNER JOIN transactions t ON dt.transaction_id = t.id
      INNER JOIN products p ON p.id = dt.product_id
      INNER JOIN products_categories pc ON p.id = pc.product_id
      INNER JOIN categories c ON pc.category_id = c.id
      WHERE t.status = "complete"`;

      let sqlGetProducts = `SELECT id, productName FROM products`;

      const dataInitSql = req.query.initYear + "-" + req.query.initMonth;
      const dataFinalSql = req.query.finalYear + "-" + req.query.finalMonth;
      if (
        req.query.productName &&
        req.query.initMonth &&
        req.query.initYear &&
        req.query.finalMonth &&
        req.query.finalYear
      ) {
        // const addSql = `WHERE DATE_FORMAT(dt.createdAt, "%Y-%m") >= '${dataInitSql}' AND DATE_FORMAT(dt.createdAt, "%Y-%m") <= "${dataFinalSql}"`

        sqlGetProductsReport += ` AND DATE_FORMAT(dt.createdAt, "%Y-%m") >= '${dataInitSql}' AND DATE_FORMAT(dt.createdAt, "%Y-%m") <= "${dataFinalSql}" AND p.productName = "${req.query.productName}"`;

        sqlGetProductsReportCount += ` AND DATE_FORMAT(dt.createdAt, "%Y-%m") >= '${dataInitSql}' AND DATE_FORMAT(dt.createdAt, "%Y-%m") <= "${dataFinalSql}" AND p.productName = "${req.query.productName}";`;

        sqlGetProductByCategory += ` AND DATE_FORMAT(dt.createdAt, "%Y-%m") >= '${dataInitSql}' AND DATE_FORMAT(dt.createdAt, "%Y-%m") <= "${dataFinalSql}"`;

        sqlGetProductsSalesByMonth += ` AND DATE_FORMAT(dt.createdAt, "%Y-%m") >= '${dataInitSql}' AND DATE_FORMAT(dt.createdAt, "%Y-%m") <= "${dataFinalSql}" AND p.productName = "${req.query.productName}"`;
      } else if (
        req.query.productName &&
        !req.query.initMonth &&
        !req.query.initYear &&
        !req.query.finalMonth &&
        !req.query.finalYear
      ) {
        sqlGetProductsReport += ` AND p.productName = "${req.query.productName}"`;

        sqlGetProductsReportCount += ` AND p.productName = "${req.query.productName}"`;

        sqlGetProductsSalesByMonth += ` AND p.productName = "${req.query.productName}"`;
      } else if (
        !req.query.productName &&
        req.query.initMonth &&
        req.query.initYear &&
        req.query.finalMonth &&
        req.query.finalYear
      ) {
        sqlGetProductsReport += ` AND DATE_FORMAT(dt.createdAt, "%Y-%m") >= '${dataInitSql}' AND DATE_FORMAT(dt.createdAt, "%Y-%m") <= "${dataFinalSql}"`;

        sqlGetProductsReportCount += ` AND DATE_FORMAT(dt.createdAt, "%Y-%m") >= '${dataInitSql}' AND DATE_FORMAT(dt.createdAt, "%Y-%m") <= "${dataFinalSql}";`;

        sqlGetProductByCategory += ` AND DATE_FORMAT(dt.createdAt, "%Y-%m") >= '${dataInitSql}' AND DATE_FORMAT(dt.createdAt, "%Y-%m") <= "${dataFinalSql}"`;

        sqlGetProductsSalesByMonth += ` AND DATE_FORMAT(dt.createdAt, "%Y-%m") >= '${dataInitSql}' AND DATE_FORMAT(dt.createdAt, "%Y-%m") <= "${dataFinalSql}"`;
      }

      sqlGetProductsReport += ` ORDER BY date ASC
        LIMIT ${req.query.limit} OFFSET ${req.query.offSet};`;

      sqlGetProductByCategory += ` GROUP BY c.name
      ORDER BY c.name ASC;`;

      sqlGetProductsSalesByMonth += ` GROUP BY date, variant, p.productName
      ORDER BY date ASC;`;

      const [products] = await connection.query(sqlGetProducts);
      const [result] = await connection.query(sqlGetProductByCategory);
      const [results] = await connection.query(sqlGetProductsReport);
      const [dataMonthly] = await connection.query(sqlGetProductsSalesByMonth);
      const [totalCount] = await connection.query(sqlGetProductsReportCount);

      const data = results.map((result) => {
        return {
          ...result,
          date: moment(result.date).format("DD MMM YYYY"),
        };
      });

      const monthlyData = dataMonthly.map((data) => {
        return {
          ...data,
          date: moment(data.date).format("MMM YYYY"),
        };
      });
      connection.release();
      res.status(200).send({ data, totalCount, result, products, monthlyData });
    } catch (error) {
      connection.release();
      next(error);
    }
  }
);

const getAllTimeRevenueRouter = router.get(
  `/all-revenue`,
  async (req, res, next) => {
    const connection = await pool.promise().getConnection();
    try {
      const sql = `SELECT sum(amount) as revenue FROM transactions where status = "complete";`;

      const sqlSold = `SELECT sum(qty) as totalSold from detailTransaction dt 
      inner join transactions t on t.id = dt.transaction_id
      where t.status = "complete";`;

      const [results] = await connection.query(sql);
      const [sold] = await connection.query(sqlSold);
      connection.release();
      res.status(200).send({ results, sold });
    } catch (error) {
      connection.release();
      next(error);
    }
  }
);

module.exports = {
  getSalesReportRouter,
  getProductsReportRouter,
  getAllTimeRevenueRouter,
};
