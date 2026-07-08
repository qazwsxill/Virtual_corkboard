// открытие главного меню
function menu_operation() {
    document.getElementById("menu_element").classList.toggle("show");
}

// отмена главного меню
window.onclick = function(event) {
    if (!event.target.closest('.drop_button') && !event.target.closest('.drop_menu')) {
        let dropdowns = document.getElementsByClassName("drop_el");
        for(let i = 0; i < dropdowns.length; i++) {
            dropdowns[i].classList.remove("show");
        }
    }
};

// календарь
const lang = navigator.language;
let date = new Date();
document.getElementById('month_name').innerHTML = date.toLocaleString(lang,{month:'long'});
document.getElementById('day_name').innerHTML = date.toLocaleString(lang,{weekday:'long'});
document.getElementById('day_number').innerHTML = date.getDate();
document.getElementById('year').innerHTML = date.getFullYear();

const API_URL = "http://localhost:3000";

const board = document.getElementById("board");
const add_button = document.getElementById("add");
const sticker_board = document.getElementById("sticker_menu");
const cancel_button = document.getElementById("cancel_button");

// открытие меню создания стикеров
add_button.addEventListener("click", () => {
    sticker_board.style.display = "block";
});

// отмена меню создания стикеров
cancel_button.addEventListener("click", () => {
    sticker_board.style.display = "none";
});

// загрузка стикера
async function load_stickers() {
    try {
        const res = await fetch(`${API_URL}/stickers`);
        const stickers = await res.json();
        const board = document.getElementById("board");
        if (!board) {
            console.error("board not found");
            return;
        }
        board.innerHTML = "";
        stickers.forEach(sticker => {
            try {
                render_sticker(sticker);
            } catch (e) {
                console.error("render error:", e, sticker);
            }
        });
    } catch (err) {
        console.error("load_stickers error:", err);
    }
}

// создание стикера
window.create_sticker = async function () {
    const text = document.getElementById("sticker_text").value;
    const color = document.getElementById("color_select").value;
    const form = document.getElementById("form_select").value;
    if (!text) {
        alert("Введите текст");
        return;
    }
    try {
        const res = await fetch("http://localhost:3000/stickers", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text, color, form: form })
        });
        const sticker = await res.json();
        if (!res.ok) {
            alert(sticker.error || "Ошибка");
            return;
        }
        document.getElementById("sticker_text").value = "";
        render_sticker(sticker);
        document.getElementById("sticker_menu").style.display = "none";
    } catch (err) {
        console.error("create_sticker error:", err);
    }
};

// отрисовка стикера
function render_sticker(sticker) {
    const div = document.createElement("div");
    div.className = "sticker";
    div.dataset.id = sticker.id;
    const board_rect = board.getBoundingClientRect();
    const final_x = sticker.position?.x ?? board_rect.width / 2 - 50;
    const final_y = sticker.position?.y ?? board_rect.height / 2 - 50;
    div.style.left = final_x + "px";
    div.style.top = final_y + "px";
    div.style.position = "absolute";
    div.style.background = sticker.color;
    div.style.padding = "15px";
    div.style.cursor = "move";
    div.style.userSelect = "none";
    div.innerText = sticker.text;
    set_sticker_form(div, sticker.form); // форма стикера
    create_delete_button(div, sticker.id); // кнопка удаления
    drag_sticker(div); // перемещение стикера по доске
    zoom_sticker(div); // увеличение стикера
    board.appendChild(div);
}

// форма стикера
function set_sticker_form(div, form) {
    if (form === "rectangle") { // прямоугольник
        div.style.width = "150px";
        div.style.height = "100px";
    }
    if (form === "square") { // квадрат
        div.style.width = "100px";
        div.style.height = "100px";
    }
    if (form === "circle") { // круг
        div.style.width = "100px";
        div.style.height = "100px";
        div.style.borderRadius = "50%";
    }
}

// удаление стикера
function create_delete_button(div, id) {
    const del = document.createElement("button");
    del.className = "sticker_delete";
    del.innerHTML = "✖";
    del.addEventListener("click", async (e)=>{
        e.stopPropagation();
        await fetch(`${API_URL}/stickers/${id}`,{
            method:"DELETE"
        });
        div.remove();
    });
    div.appendChild(del);
}

//обработка столкновения при передвижении стикера
function intersects(a,b){

    return !(
        a.right < b.left ||
        a.left > b.right ||
        a.bottom < b.top ||
        a.top > b.bottom
    );

}



function check_collision(div,x,y){
    const board_rect = board.getBoundingClientRect();
    const sticker_rect={
        left: board_rect.left + x,
        top: board_rect.top + y,
        right: board_rect.left + x + div.offsetWidth,
        bottom: board_rect.top + y + div.offsetHeight
    };
    const forbidden = [
        document.querySelector(".cat"),
        document.querySelector(".note")
    ];
    for(const item of forbidden){
        if (!item) {
            continue;
        }
        if (intersects(sticker_rect, item.getBoundingClientRect())) {
            return true;
        }
    }
    return false;
}

// перемещение стикера
function drag_sticker(div){
    let is_dragging = false;
    let start_x;
    let start_y;
    let shift_x;
    let shift_y;
    let moved_distance = 0;
    const THRESHOLD = 5;
    div.dataset.dragged = "false";
    div.addEventListener("mousedown",(e) => {
        if (e.target.className === "sticker_delete") {
            return;
        }
        is_dragging = true;
        moved_distance = 0;
        const rect = div.getBoundingClientRect();
        start_x = e.clientX;
        start_y = e.clientY;
        shift_x = e.clientX - rect.left;
        shift_y = e.clientY - rect.top;
    });
    document.addEventListener("mousemove",(e)=>{
        if (!is_dragging) {
            return;
        }
        const dx = e.clientX - start_x;
        const dy = e.clientY - start_y;
        moved_distance = Math.sqrt(dx * dx + dy * dy);
        if (moved_distance > THRESHOLD) {
            div.dataset.dragged = "true";
        }
        const board_rect = board.getBoundingClientRect();
        let x = e.clientX - board_rect.left - shift_x;
        let y = e.clientY - board_rect.top - shift_y;
        const max_x = board.clientWidth - div.offsetWidth;
        const max_y = board.clientHeight - div.offsetHeight;
        x = Math.max(0,Math.min(x,max_x));
        y = Math.max(0,Math.min(y,max_y));
        if (check_collision(div,x,y)) {
            return;
        }
        div.style.left = x + "px";
        div.style.top = y + "px";
    });
    document.addEventListener("mouseup",() => {
        is_dragging = false;
        setTimeout(() => {
            div.dataset.dragged="false";
        }, 50);
    });
}

// увеличение стикера
function zoom_sticker(div) {
    div.addEventListener("click",() => {
        if (div.dataset.dragged === "true") {
            return;
        }
        div.classList.toggle("zoomed");
    });
}

// сохранение стикеров
document.getElementById("save").addEventListener("click", async () => {
    const stickers = document.querySelectorAll(".sticker");
    for (const s of stickers) {
        await fetch(`${API_URL}/stickers/${s.dataset.id}/position`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                x: parseInt(s.style.left),
                y: parseInt(s.style.top)
            })
        });
    }
    await fetch(`${API_URL}/stickers/save`, {
        method: "POST"
    });
    alert("Сохранение выполнено!");
});

// полное очищение доски со стикерами
document.getElementById("delete_all").addEventListener("click", async () => {
    const confirm_reset = confirm("Точно хотите удалить все стикеры?");
    if (!confirm_reset) {
        return;
    }
    try {
        const res = await fetch(`${API_URL}/stickers`);
        const stickers = await res.json();
        for (const s of stickers) {
            await fetch(`${API_URL}/stickers/${s.id}`, {
                method: "DELETE"
            });
        }
        board.innerHTML = "";
        alert("Доска очищена!");
    } catch (err) {
        console.log(err);
    }
});

// загрузка
load_stickers();

// функция печати - скриншот доски со стикерами
document.getElementById("print").addEventListener("click", printBoard);
async function printBoard() {
    const board = document.getElementById("main_board");
    const hideElements = [
        document.querySelector(".cat"),
        document.querySelector(".drop_menu"),
        ...document.querySelectorAll(".sticker-delete")
    ];
    hideElements.forEach(el => {
        if (el) {
            el.style.display = "none";
        }
    });
    const canvas = await html2canvas(board, {
        scale: 2,
        useCORS: true,
        backgroundColor: null
    });
    hideElements.forEach(el => {
        if (el) {
            el.style.display = "";
        }
    });
    const img = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: "a4"
    });
    const page_width = pdf.internal.pageSize.getWidth();
    const page_height = pdf.internal.pageSize.getHeight();
    const img_width = canvas.width;
    const img_height = canvas.height;
    const ratio = Math.min(page_width / img_width, page_height / img_height);
    const print_width = img_width * ratio;
    const print_height = img_height * ratio;
    const x = (page_width - print_width) / 2;
    const y = (page_height - print_height) / 2;
    pdf.addImage(img, "PNG", x, y, print_width, print_height);
    pdf.save("virtual_corkboard.pdf");
}