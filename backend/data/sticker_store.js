const { v4: uuidv4 } = require("uuid");

const fs = require("fs");

const path = require("path");

const FILE_PATH = path.join(__dirname, "stickers.json");

class StickerStore {
    
    constructor() { this.stickers = []; this.load(); } // пустой конструктор

    // загрузка стикеров
    load() {
        if (fs.existsSync(FILE_PATH)) {
            const data = fs.readFileSync(FILE_PATH, "utf8");
            if (data) {
                this.stickers = JSON.parse(data);
            }
        }
    }

    // сохранение стикеров
    save() {
        fs.writeFileSync(FILE_PATH, JSON.stringify(this.stickers, null, 2));
    }

    // создание нового стикера
    create_sticker(text, color, form) {
        const sticker = {
            id: uuidv4(),
            text,
            color,
            form,
            position: { x: 50, y: 50 }
        };
        this.stickers.push(sticker);
        return sticker;
    }

    // изменение координат стикера
    update_position(id, x, y) {
        const sticker = this.stickers.find(s => s.id === id);
        if (sticker) {
            sticker.position = { x, y };
        }
        return sticker;
    }

    // удаление стикера
    delete_sticker(id) {
    const old_length = this.stickers.length;
    this.stickers = this.stickers.filter(s => s.id !== id);
    if (this.stickers.length === old_length) {
        return false;
    }
    this.save();
    return true;
    }

    // получение всех стикеров
    get_stickers() {
        return this.stickers;
    }
}

module.exports = new StickerStore();