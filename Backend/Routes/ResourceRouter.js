import express from "express";
import {
    getResourcesBySkill,
    searchResources,
    createResource,
} from "../Controllers/ResourceController.js";
import authMiddleware from "../Middleware/authMiddleware.js";

export const resourceRouter = express.Router();

// Public GET routes — no auth required so any user can browse resources
resourceRouter.get("/search", searchResources);   // GET /api/resources/search?q=React
resourceRouter.get("/", getResourcesBySkill);     // GET /api/resources?skill=React

// Protected POST route — only logged-in users can add resources
resourceRouter.post("/", authMiddleware, createResource);
