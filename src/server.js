require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// Cargamos el "sistema_usuarios_db" desde data.json (mismo folder que este archivo)
const dataPath = path.join(__dirname, "data.json");
const db = JSON.parse(fs.readFileSync(dataPath, "utf8")).sistema_usuarios_db;

app.post("/login", async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ ok: false, message: "Correo y contraseña son requeridos" });
        }

        const correoNormalizado = correo.trim().toLowerCase();
        const usuario = db.usuarios.find(
            (u) => u.email.toLowerCase() === correoNormalizado
        );

        // No revelamos si el problema fue el correo o la contraseña (buena práctica)
        if (!usuario) {
            return res.status(401).json({ ok: false, message: "Correo o contraseña incorrectos" });
        }

        const coincide = await bcrypt.compare(contrasena, usuario.password_hash);

        if (!coincide) {
            return res.status(401).json({ ok: false, message: "Correo o contraseña incorrectos" });
        }

        const estatus = db.estatus.find((e) => e.id === usuario.estatus_id);

        if (estatus && estatus.nombre !== "activo") {
            return res.status(403).json({
                ok: false,
                message: `Tu cuenta está ${estatus.nombre}. Contacta a un administrador.`,
            });
        }

        const rol = db.roles.find((r) => r.id === usuario.rol_id);

        // Login correcto
        res.json({
            ok: true,
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email,
                rol: rol ? rol.nombre : null,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, message: "Error servidor" });
    }
});

app.listen(5500, () => {
    console.log("Servidor corriendo en http://localhost:5500");
});