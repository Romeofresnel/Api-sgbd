import { deleteUserServices, getAllUserServices, getOneUserServices, newUserServices, updateUserServices } from "../models/utilisateur.model.js"


const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    })
}

export const newUser = async (req, res, next) => {
    const { nom, email, password } = req.body
    try {
        const newUser = await newUserServices(nom, email, password)
        handleResponse(res, 201, "User creer avec success", newUser)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const getAllUser = async (req, res, next) => {
    try {
        const User = await getAllUserServices()
        handleResponse(res, 200, "User afficher avec success", User)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const getOneUser = async (req, res, next) => {
    try {
        const User = await getOneUserServices(req.params.id)
        if (!User) {
            return handleResponse(res, 404, "User introuvable")
        }
        handleResponse(res, 200, "User afficher avec success", User)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const updateUser = async (req, res, next) => {
    const { nom, email, password } = req.body
    try {
        const updateUser = await updateUserServices(req.params.id, nom, email, password)
        if (!updateUser) {
            return handleResponse(res, 404, "User introuvable")
        }
        handleResponse(res, 200, "User modifier avec success", updateUser)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const deleteUser = async (req, res, next) => {
    try {
        const deleteUser = await deleteUserServices(req.params.id)
        if (!deleteUser) {
            return handleResponse(res, 404, "User introuvable")
        }
        handleResponse(res, 200, "User supprimer avec success", deleteUser)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
