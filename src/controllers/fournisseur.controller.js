import {
    deleteFournisseurServices,
    getAllFournisseurServices,
    getFournisseursByProduitServices,
    getOneFournisseurServices,
    newFournisseurServices,
    updateFournisseurServices
} from "../models/fournisseur.model.js";

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    });
};

export const newFournisseur = async (req, res, next) => {
    // ✅ CORRECTION: Ajout de produit_id et ordre des paramètres corrigé
    const { nom, adresse, email, telephone, produit_id } = req.body;

    // Validation des champs obligatoires
    if (!nom || !adresse || !email || !telephone || !produit_id) {
        return handleResponse(res, 400, "Tous les champs sont obligatoires (nom, adresse, email, telephone, produit_id)");
    }

    try {
        // Ordre correct: nom, adresse, email, telephone, produit_id
        const newFournisseur = await newFournisseurServices(nom, adresse, email, telephone, produit_id);
        handleResponse(res, 201, "Fournisseur créé avec succès", newFournisseur);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

export const getAllFournisseur = async (req, res, next) => {
    try {
        const fournisseurs = await getAllFournisseurServices();
        handleResponse(res, 200, "Fournisseurs affichés avec succès", fournisseurs);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

export const getOneFournisseur = async (req, res, next) => {
    try {
        const fournisseur = await getOneFournisseurServices(req.params.id);
        if (!fournisseur) {
            return handleResponse(res, 404, "Fournisseur introuvable");
        }
        handleResponse(res, 200, "Fournisseur affiché avec succès", fournisseur);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

export const getAllFournisseurByProduit = async (req, res, next) => {
    try {
        const fournisseurs = await getFournisseursByProduitServices(req.params.id);
        handleResponse(res, 200, "Fournisseurs du produit affichés avec succès", fournisseurs);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

export const updateFournisseur = async (req, res, next) => {
    // ✅ CORRECTION: Ajout de produit_id et ordre des paramètres corrigé
    const { nom, adresse, email, telephone, produit_id } = req.body;

    try {
        // Ordre correct: id, nom, adresse, email, telephone, produit_id
        const updatedFournisseur = await updateFournisseurServices(
            req.params.id,
            nom,
            adresse,
            email,
            telephone,
            produit_id
        );

        handleResponse(res, 200, "Fournisseur modifié avec succès", updatedFournisseur);
    } catch (error) {
        console.log(error.message);
        // ✅ CORRECTION: Gestion spécifique des erreurs du modèle
        if (error.message.includes("n'existe pas") || error.message.includes("Aucun fournisseur trouvé")) {
            return handleResponse(res, 404, error.message);
        }
        next(error);
    }
};

export const deleteFournisseur = async (req, res, next) => {
    try {
        const deletedFournisseur = await deleteFournisseurServices(req.params.id);
        handleResponse(res, 200, "Fournisseur supprimé avec succès", deletedFournisseur);
    } catch (error) {
        console.log(error.message);
        // ✅ CORRECTION: Gestion spécifique des erreurs du modèle
        if (error.message.includes("Aucun fournisseur trouvé")) {
            return handleResponse(res, 404, error.message);
        }
        next(error);
    }
};