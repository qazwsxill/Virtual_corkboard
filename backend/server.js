const express = require("express");

const path = require("path");

const cors = require("cors");

const COLORS = require("./models/colors");

const FORMS = require("./models/forms");

const stickerStore = require("./data/sticker_store");

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.static(path.join(__dirname, "../frontend")));

app.get("/colors", (req,res) => {
    res.json(COLORS);
});

app.get("/forms",(req,res) => {
    res.json(Object.values(FORMS));
});

app.get("/stickers",(req,res) => {
    res.json(stickerStore.get_stickers());
});

app.post("/stickers",(req,res) => { // создание стикера
    const {text, color, form} = req.body;
    if (!text || text.trim() === "") {return res.status(400).json({error:"Отсутствует текст"});
    }
    if(!COLORS.includes(color)){
        return res.status(400).json({error:"Выбран неверный цвет стикера"});
    }
    if(!Object.values(FORMS).includes(form)){
        return res.status(400).json({error:"Выбрана неверная форма стикера"});
    }
    const sticker = stickerStore.create_sticker(text, color, form);
    res.status(201).json(sticker);
});

app.put("/stickers/:id/position", (req, res) => { // обновление коориднат стикера
    const {x, y} = req.body;
    const sticker = stickerStore.update_position(req.params.id, x, y);
    if (!sticker) {
        return res.status(404).json({error: "Стикер не найден"});
    }
    res.json(sticker);
});

app.delete("/stickers/:id", (req,res) => { // удаление стикера
    const deleted = stickerStore.delete_sticker(req.params.id);
    if (!deleted) {
        return res.status(404).json({error:"Стикер не найден"});
    }
    res.json({message:"Стикер удален"});
});

app.post("/stickers/save", (req, res) => { // сохранение стикеров
    stickerStore.save();
    res.json({ message: "saved" });
});

app.listen(3000,() => {
    console.log("Server started on port 3000");
});