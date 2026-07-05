const { v4: uuidv4 } = require("uuid"); // генерация идентификатора стикера

class stickerStore { // класс стикера
    constructor() { this.stickers = []; } // пустой конструктор

    create_sticker(text, color, form) { // создание стикера
        const sticker = { id: uuidv4(), text, color, form, position: { x: 50, y: 50 }};
        this.stickers.push(sticker);
        return sticker;
    }

    update_position(id, x, y) { // обновление координат стикера
        const sticker = this.stickers.find(s => s.id === id);
        if (sticker) {
            sticker.position = { x, y };
        }
        return sticker;
    }

    delete_sticker(id) { // удаление стикера
        this.stickers = this.stickers.filter(s => s.id !== id);
    }

    get_stickers() { // получение списка стикеров
        return this.stickers;
    }
}

module.exports = new stickerStore();