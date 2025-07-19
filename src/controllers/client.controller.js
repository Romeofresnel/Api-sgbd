import { deleteClientServices, getAllClientServices, getOneClientServices, newClientServices, updateClientServices } from "../models/client.model.js"


const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    })
}

export const newClient = async (req, res, next) => {
    const { nom, contact } = req.body
    try {
        const newClient = await newClientServices(nom, contact)
        handleResponse(res, 201, "Client creer avec success", newClient)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const getAllClient = async (req, res, next) => {
    try {
        const Client = await getAllClientServices()
        handleResponse(res, 200, "Client afficher avec success", Client)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const getOneClient = async (req, res, next) => {
    try {
        const Client = await getOneClientServices(req.params.id)
        if (!Client) {
            return handleResponse(res, 404, "Client introuvable")
        }
        handleResponse(res, 200, "Client afficher avec success", Client)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const updateClient = async (req, res, next) => {
    const { id } = req.params;

    const { nom, contact } = req.body
    try {
        const updateClient = await updateClientServices(nom, contact, id)
        if (!updateClient) {
            return handleResponse(res, 404, "Client introuvable")
        }
        handleResponse(res, 200, "Client modifier avec success", updateClient)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const deleteClient = async (req, res, next) => {
    try {
        const deleteClient = await deleteClientServices(req.params.id)
        if (!deleteClient) {
            return handleResponse(res, 404, "Client introuvable")
        }
        handleResponse(res, 200, "Client supprimer avec success", deleteClient)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
