import {
    deleteCommandeServices,
    getAllCommandeServices,
    getCommandesByProduitServices,
    getCommandesByFournisseurServices,
    getOneCommandeServices,
    newCommandeServices,
    updateCommandeServices
} from "../models/commande.model.js";

const handleResponse = (res, status, message, data = null) => {
    res.status(status).json({
        status,
        message,
        data,
    });
};

export const newCommande = async (req, res, next) => {
    const { dates, produit_id, prix_unitaire, montant_total, statut, quantite, fournisseur_id } = req.body;

    // Validation des champs obligatoires
    if (!produit_id || !quantite || !fournisseur_id) {
        return handleResponse(res, 400, "Tous les champs sont obligatoires (date, produit_id, quantite, fournisseur_id)");
    }

    // Validation de la quantité
    if (quantite <= 0 || !Number.isInteger(Number(quantite))) {
        return handleResponse(res, 400, "La quantité doit être un nombre entier positif");
    }

    try {
        const newCommande = await newCommandeServices(dates, produit_id, prix_unitaire, montant_total, statut, quantite, fournisseur_id);
        handleResponse(res, 201, "Commande créée avec succès", newCommande);
    } catch (error) {
        console.log(error.message);

        // Gestion spécifique des erreurs de validation
        if (error.message.includes("n'existe pas") ||
            error.message.includes("n'appartient pas")) {
            return handleResponse(res, 400, error.message);
        }

        next(error);
    }
};

export const getAllCommande = async (req, res, next) => {
    try {
        const commandes = await getAllCommandeServices();
        handleResponse(res, 200, "Commandes récupérées avec succès", commandes);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

export const getOneCommande = async (req, res, next) => {
    const { id } = req.params;

    try {
        const commande = await getOneCommandeServices(id);
        handleResponse(res, 200, "Commande récupérée avec succès", commande);
    } catch (error) {
        console.log(error.message);

        // Gestion spécifique de l'erreur "non trouvé"
        if (error.message.includes("Aucune commande trouvée")) {
            return handleResponse(res, 404, error.message);
        }

        next(error);
    }
};

export const getAllCommandeByProduit = async (req, res, next) => {
    const { id: produit_id } = req.params;
    try {
        const commandes = await getCommandesByProduitServices(produit_id);
        handleResponse(res, 200, "Commandes du produit récupérées avec succès", commandes);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

export const getAllCommandeByFournisseur = async (req, res, next) => {
    const { id: fournisseur_id } = req.params;
    try {
        const commandes = await getCommandesByFournisseurServices(fournisseur_id);
        handleResponse(res, 200, "Commandes du fournisseur récupérées avec succès", commandes);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

export const updateCommande = async (req, res, next) => {
    const { id } = req.params;
    const { dates, produit_id, prix_unitaire, montant_total, statut, quantite, fournisseur_id, } = req.body;

    if (quantite && (quantite <= 0 || !Number.isInteger(Number(quantite)))) {
        return handleResponse(res, 400, "La quantité doit être un nombre entier positif");
    }

    // Au moins un champ doit être fourni pour la mise à jour
    if (!dates && !produit_id && !quantite && !fournisseur_id) {
        return handleResponse(res, 400, "Au moins un champ doit être fourni pour la mise à jour");
    }

    try {
        const updatedCommande = await updateCommandeServices(
            dates, produit_id, prix_unitaire, montant_total, statut, quantite, fournisseur_id, id
        );

        handleResponse(res, 200, "Commande modifiée avec succès", updatedCommande);
    } catch (error) {
        console.log(error.message);
        next(error);
    }
};

export const deleteCommande = async (req, res, next) => {
    const { id } = req.params;

    try {
        const deletedCommande = await deleteCommandeServices(id);
        handleResponse(res, 200, "Commande supprimée avec succès", deletedCommande);
    } catch (error) {
        console.log(error.message);

        next(error);
    }
};