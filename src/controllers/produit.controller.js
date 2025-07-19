import { deleteProduitServices, getAllProduitServices, getOneProduitServices, newProduitServices, updateProduitServices } from "../models/produit.model.js"


const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    })
}

export const newProduit = async (req, res, next) => {
    const { nom, ref, prix_achat, prix_vente, stock, categorie, statut } = req.body
    try {
        const newProduit = await newProduitServices(nom, ref, prix_achat, prix_vente, stock, categorie, statut)
        handleResponse(res, 201, "produit creer avec success", newProduit)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const getAllProduit = async (req, res, next) => {
    try {
        const produit = await getAllProduitServices()
        handleResponse(res, 200, "produit afficher avec success", produit)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const getOneProduit = async (req, res, next) => {
    try {
        const produit = await getOneProduitServices(req.params.id)
        if (!produit) {
            return handleResponse(res, 404, "produit introuvable")
        }
        handleResponse(res, 200, "produit afficher avec success", produit)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const updateProduit = async (req, res, next) => {
    const { nom, ref, prix_achat, prix_vente, stock, categorie, statut } = req.body
    try {
        const updateProduit = await updateProduitServices(req.params.id, nom, ref, prix_achat, prix_vente, stock, categorie, statut)
        if (!updateProduit) {
            return handleResponse(res, 404, "produit introuvable")
        }
        handleResponse(res, 200, "produit modifier avec success", updateProduit)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const deleteProduit = async (req, res, next) => {
    const { id } = req.params
    try {
        const deleteProduit = await deleteProduitServices(id)
        if (!deleteProduit) {
            return handleResponse(res, 404, "produit introuvable")
        }
        handleResponse(res, 200, "produit supprimer avec success", deleteProduit)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
