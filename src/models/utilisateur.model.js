import pool from "../config/db.js";

export const getAllUserServices = async () => {
    const result = await pool.query("SELECT * FROM user")
    return result.rows
}
export const getOneUserServices = async (id) => {
    const result = await pool.query("SELECT * FROM user where id=$1", [id])
    return result.rows[0]
}
export const newUserServices = async (nom, email, password) => {
    const result = await pool.query("INSERT INTO user (nom, email, password) VALUES ($1, $2, $3) RETURNING *", [nom, email, password])
    return result.rows[0]
}
export const updateUserServices = async (id, nom, email, password) => {
    const result = await pool.query("UPDATE user SET nom=$1, email=$2, password=$3 WHERE id=$4 RETURNING *", [nom, email, password, id])
    return result.rows[0]
}
export const deleteUserServices = async (id) => {
    const result = await pool.query("DELETE FROM user WHERE id=$1 RETURNING *", [id])
    return result.rows[0]

}
