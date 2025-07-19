import { deleteVenteServices, getAllVenteServices, getOneVenteServices, getVentesByClientServices, getVentesByPeriodServices, getVentesByProduitServices, newVenteServices, updateVenteServices } from "../models/vente.model.js"


const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    })
}

export const newVente = async (req, res, next) => {
    const { dates, quantite, prix_unitaire, client_id, montant_total, mode_paiement, produit_id } = req.body
    try {
        const newVente = await newVenteServices(dates, quantite, prix_unitaire, client_id, montant_total, mode_paiement, produit_id)
        handleResponse(res, 201, "Vente creer avec success", newVente)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const getAllVente = async (req, res, next) => {
    try {
        const Vente = await getAllVenteServices()
        handleResponse(res, 200, "Vente afficher avec success", Vente)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const getAllVenteByClient = async (req, res, next) => {
    try {
        const Vente = await getVentesByClientServices(req.params.id)
        if (!Vente) {
            return handleResponse(res, 404, "Vente introuvable")
        }
        handleResponse(res, 200, "Vente afficher avec success", Vente)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const getAllVenteByProduit = async (req, res, next) => {
    try {
        const Vente = await getVentesByProduitServices(req.params.id)
        if (!Vente) {
            return handleResponse(res, 404, "Vente introuvable")
        }
        handleResponse(res, 200, "Vente afficher avec success", Vente)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const getAllVenteByPeriode = async (req, res, next) => {
    const { dateStar, dateEnd } = req.body
    try {
        const Vente = await getVentesByPeriodServices(dateStar, dateEnd)
        if (!Vente) {
            return handleResponse(res, 404, "Vente introuvable")
        }
        handleResponse(res, 200, `Vente effectuer de la periode ${dateStar} a ${dateEnd} afficher avec success`, Vente)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const getOneVente = async (req, res, next) => {
    try {
        const Vente = await getOneVenteServices(req.params.id)
        if (!Vente) {
            return handleResponse(res, 404, "Vente introuvable")
        }
        handleResponse(res, 200, "Vente afficher avec success", Vente)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const updateVente = async (req, res, next) => {
    const { dates, quantite, prix_unitaire, client_id, montant_total, mode_paiement, produit_id } = req.body
    try {
        const updateVente = await updateVenteServices(req.params.id, dates, quantite, prix_unitaire, client_id, montant_total, mode_paiement, produit_id)
        if (!updateVente) {
            return handleResponse(res, 404, "Vente introuvable")
        }
        handleResponse(res, 200, "Vente modifier avec success", updateVente)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
export const deleteVente = async (req, res, next) => {
    try {
        const deleteVente = await deleteVenteServices(req.params.id)
        if (!deleteVente) {
            return handleResponse(res, 404, "Vente introuvable")
        }
        handleResponse(res, 200, "Vente supprimer avec success", deleteVente)
    } catch (error) {
        console.log(error.message);
        next(error)
    }
}
