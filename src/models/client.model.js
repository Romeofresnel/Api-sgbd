import pool from "../config/db.js";

export const getAllClientServices = async () => {
    const result = await pool.query("SELECT * FROM client")
    return result.rows
}
export const getOneClientServices = async (id) => {
    const result = await pool.query("SELECT * FROM client where id = $1", [id])
    return result.rows[0]
}
export const newClientServices = async (nom, contact) => {
    const result = await pool.query("INSERT INTO client (nom, contact) VALUES ($1, $2) RETURNING * ", [nom, contact])
    return result.rows[0]
}
export const updateClientServices = async (nom, contact, id) => {
    const result = await pool.query("UPDATE client SET nom=$1, contact=$2 WHERE id=$3 RETURNING *", [nom, contact, id])
    return result.rows[0]
}
export const deleteClientServices = async (id) => {
    const result = await pool.query("DELETE FROM client WHERE id=$1 RETURNING *", [id])
    return result.rows[0]

}
