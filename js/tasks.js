/*
    هنا نخزن المهام الحالية داخل مصفوفة
    حتى نعرضها ونعدل عليها بسهولة
*/
let tasks = [];

/*
    هذا المتغير نستخدمه إذا كنا نعدل مهمة موجودة
    لو كانت null معناها نحن في وضع إضافة مهمة جديدة
*/
let editId = null;

/*
    نأخذ اللغة الحالية من الصفحة نفسها
    لأن الصفحة عندنا أصلًا ماشية على لغة السيرفر
*/
let curLang = window.tasksPageLang || document.documentElement.lang || "ar";

/*
    هذا الفلتر الحالي:
    all / pending / done
*/
let currentFilter = "all";

/*
    هنا النصوص الخاصة بالعربي والإنجليزي
    استخدمناها حتى الكروت والرسائل الديناميكية تطلع بنفس لغة الصفحة
*/
const ui = {
    ar: {
        mainTitle: "مهامي اليومية",
        subTitle: "رتّب مهامك اليومية بسهولة ووضوح.",
        searchPlaceholder: "ابحث عن مهمة...",
        filterAll: "الكل",
        filterPending: "قيد التنفيذ",
        filterDone: "منجزة",
        btnAdd: "+ إضافة مهمة",
        summaryAll: "كل المهام",
        summaryDone: "المنجزة",
        summaryPending: "المتبقية",
        emptyTitle: "لا توجد مهام بعد",
        emptyDesc: "ابدأ بإضافة أول مهمة لك.",
        mTitleAdd: "إضافة مهمة",
        mTitleEdit: "تعديل المهمة",
        labelTaskName: "اسم المهمة",
        labelTaskDay: "اليوم",
        labelTaskTime: "الوقت",
        labelTaskIcon: "نوع المهمة",
        mSave: "حفظ",
        mCancel: "إلغاء",
        done: "تم",
        undo: "تراجع",
        edit: "تعديل",
        delete: "حذف",
        statusDone: "منجزة",
        statusPending: "قيد التنفيذ",
        dayOptions: ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
        iconOptions: ["📚 دراسة","💻 مشروع","⏰ تذكير","❤️ صحة","🏠 منزل","🍽️ طعام","🏋️ رياضة"],
        confirmDelete: "هل تريد حذف هذه المهمة؟",
        taskAdded: "تمت إضافة المهمة",
        taskUpdated: "تم تعديل المهمة",
        taskDeleted: "تم حذف المهمة",
        taskDoneToast: "تم تحديث حالة المهمة",
        saveFailed: "فشل حفظ المهمة",
        updateFailed: "فشل تعديل المهمة",
        requiredAlert: "أدخلي اسم المهمة والوقت"
    },
    en: {
        mainTitle: "My Daily Tasks",
        subTitle: "Organize your daily tasks clearly and simply.",
        searchPlaceholder: "Search for a task...",
        filterAll: "All",
        filterPending: "Pending",
        filterDone: "Done",
        btnAdd: "+ Add Task",
        summaryAll: "All Tasks",
        summaryDone: "Done",
        summaryPending: "Pending",
        emptyTitle: "No tasks yet",
        emptyDesc: "Start by adding your first task.",
        mTitleAdd: "Add Task",
        mTitleEdit: "Edit Task",
        labelTaskName: "Task Name",
        labelTaskDay: "Day",
        labelTaskTime: "Time",
        labelTaskIcon: "Task Type",
        mSave: "Save",
        mCancel: "Cancel",
        done: "Done",
        undo: "Undo",
        edit: "Edit",
        delete: "Delete",
        statusDone: "Done",
        statusPending: "Pending",
        dayOptions: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
        iconOptions: ["📚 Study","💻 Project","⏰ Reminder","❤️ Health","🏠 Home","🍽️ Food","🏋️ Workout"],
        confirmDelete: "Do you want to delete this task?",
        taskAdded: "Task added successfully",
        taskUpdated: "Task updated successfully",
        taskDeleted: "Task deleted successfully",
        taskDoneToast: "Task status updated",
        saveFailed: "Failed to save task",
        updateFailed: "Failed to update task",
        requiredAlert: "Enter task name and time"
    }
};

/*
    هذه الدالة ترسل الطلبات إلى tasks_api.php
    استخدمنا JSON حتى يكون التعامل أوضح وأرتب
*/
async function apiRequest(action, payload = {}) {
    const response = await fetch("./tasks_api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload })
    });

    return response.json();
}

/*
    دالة صغيرة حتى نغير نص عنصر إذا كان موجود
*/
function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/*
    هذا التوست لعرض رسائل سريعة
*/
function showToast(message) {
    const toast = document.getElementById("tasksToast");
    if (!toast) return;

    toast.textContent = message;
    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 2500);
}

/*
    هنا نفلتر المهام حسب:
    - البحث
    - حالة الفلتر الحالي
*/
function filteredTasks() {
    const searchValue = document.getElementById("taskSearch")?.value.trim().toLowerCase() || "";
    let result = [...tasks];

    if (searchValue) {
        result = result.filter(task => task.title.toLowerCase().includes(searchValue));
    }

    if (currentFilter === "done") {
        result = result.filter(task => Number(task.is_done) === 1);
    } else if (currentFilter === "pending") {
        result = result.filter(task => Number(task.is_done) === 0);
    }

    return result;
}

/*
    هنا نحدث أرقام الملخص
*/
function renderStats() {
    const total = tasks.length;
    const done = tasks.filter(t => Number(t.is_done) === 1).length;
    const pending = total - done;

    const totalEl = document.getElementById("totalTasksCount");
    const doneEl = document.getElementById("doneTasksCount");
    const pendingEl = document.getElementById("pendingTasksCount");

    if (totalEl) totalEl.textContent = total;
    if (doneEl) doneEl.textContent = done;
    if (pendingEl) pendingEl.textContent = pending;
}

/*
    هذه أهم دالة:
    تعرض الكروت داخل الصفحة
*/
function renderTasks() {
    const grid = document.getElementById("taskGrid");
    const emptyState = document.getElementById("emptyState");
    if (!grid) return;
    
    const t = ui[curLang];
    const result = filteredTasks();

    grid.innerHTML = result.map(task => `
        <div class="task-card ${Number(task.is_done) === 1 ? "done" : ""}" draggable="true" data-id="${task.task_id}">
            <div class="task-head">
                <div class="task-icon">
                    <i class="fas ${task.icon}"></i>
                </div>
                <div class="task-badge">${Number(task.is_done) === 1 ? t.statusDone : t.statusPending}</div>
            </div>

            <div class="task-name">${task.title}</div>

            <div class="task-meta">
                <div class="task-time">${String(task.task_time).slice(0,5)}</div>
                <div class="task-day">${task.task_day}</div>
            </div>

            <div class="task-actions">
                <button class="btn-done" onclick="toggleDone(${task.task_id})">
                    ${Number(task.is_done) === 1 ? t.undo : t.done}
                </button>
                <button class="btn-edit" onclick="editTask(${task.task_id})">
                    ${t.edit}
                </button>
                <button class="btn-delete" onclick="deleteTask(${task.task_id})">
                    ${t.delete}
                </button>
            </div>
        </div>
    `).join("");

    if (emptyState) emptyState.style.display = result.length ? "none" : "block";

    renderStats();
    setupDragAndDrop();
}

/*
    هنا نجيب المهام من قاعدة البيانات
*/
async function loadTasks() {
    try {
        const result = await apiRequest("list");
        if (result.success) {
            tasks = result.tasks || [];
            renderTasks();
        } else {
            console.error(result);
        }
    } catch (e) {
        console.error("API error", e);
    }
}

/*
    فتح المودال
*/
function openTaskModal() {
    const modal = document.getElementById("taskModal");
    if (modal) modal.style.display = "flex";
}

/*
    إغلاق المودال
*/
function closeTaskModal() {
    const modal = document.getElementById("taskModal");
    if (modal) modal.style.display = "none";
    clearModalFields();
}

/*
    تنظيف الحقول بعد الإضافة أو الإغلاق
*/
function clearModalFields() {
    editId = null;

    const nameInput = document.getElementById("taskName");
    const timeInput = document.getElementById("taskTime");
    const daySelect = document.getElementById("taskDay");
    const iconSelect = document.getElementById("taskIcon");
    const titleEl = document.getElementById("mTitle");

    if (nameInput) nameInput.value = "";
    if (timeInput) timeInput.value = "";
    if (daySelect) daySelect.selectedIndex = 0;
    if (iconSelect) iconSelect.selectedIndex = 0;
    if (titleEl) titleEl.textContent = ui[curLang].mTitleAdd;
}

/*
    حفظ مهمة جديدة أو تعديل مهمة موجودة
*/
async function saveTask() {
    const t = ui[curLang];

    const title = document.getElementById("taskName")?.value.trim();
    const task_day = document.getElementById("taskDay")?.value;
    const task_time = document.getElementById("taskTime")?.value;
    const icon = document.getElementById("taskIcon")?.value;

    if (!title || !task_time) {
        alert(t.requiredAlert);
        return;
    }

    try {
        let result;

        if (editId) {
            result = await apiRequest("update", { task_id: editId, title, task_day, task_time, icon });

            if (!result.success) {
                alert(t.updateFailed);
                return;
            }

            showToast(t.taskUpdated);
        } else {
            result = await apiRequest("create", { title, task_day, task_time, icon });

            if (!result.success) {
                alert(t.saveFailed);
                return;
            }

            showToast(t.taskAdded);
        }

        closeTaskModal();
        await loadTasks();
    } catch (error) {
        alert("JS/API error: " + error.message);
    }
}

/*
    تغيير حالة المهمة: منجزة / غير منجزة
*/
async function toggleDone(taskId) {
    const result = await apiRequest("toggle_done", { task_id: taskId });

    if (result.success) {
        showToast(ui[curLang].taskDoneToast);
        await loadTasks();
    }
}

/*
    حذف مهمة
*/
async function deleteTask(taskId) {
    if (confirm(ui[curLang].confirmDelete)) {
        const result = await apiRequest("delete", { task_id: taskId });

        if (result.success) {
            showToast(ui[curLang].taskDeleted);
            await loadTasks();
        }
    }
}

/*
    تعبئة المودال ببيانات المهمة عند التعديل
*/
function editTask(taskId) {
    const task = tasks.find(item => Number(item.task_id) === Number(taskId));
    if (!task) return;

    editId = taskId;

    const nameInput = document.getElementById("taskName");
    const timeInput = document.getElementById("taskTime");
    const daySelect = document.getElementById("taskDay");
    const iconSelect = document.getElementById("taskIcon");
    const titleEl = document.getElementById("mTitle");

    if (nameInput) nameInput.value = task.title;
    if (timeInput) timeInput.value = String(task.task_time).slice(0,5);
    if (daySelect) daySelect.value = task.task_day;
    if (iconSelect) iconSelect.value = task.icon;
    if (titleEl) titleEl.textContent = ui[curLang].mTitleEdit;

    openTaskModal();
}

/*
    هنا نطبق اللغة على العناصر الديناميكية داخل الصفحة
    لأن الكروت نفسها تُرسم بالجافاسكربت
*/
function applyLanguage() {
    const t = ui[curLang];

    document.documentElement.lang = curLang;
    document.documentElement.dir = curLang === "ar" ? "rtl" : "ltr";

    setText("mainTitle", t.mainTitle);
    setText("subTitle", t.subTitle);

    const searchInput = document.getElementById("taskSearch");
    if (searchInput) searchInput.placeholder = t.searchPlaceholder;

    setText("btnAdd", t.btnAdd);
    setText("filterAll", t.filterAll);
    setText("filterPending", t.filterPending);
    setText("filterDone", t.filterDone);

    const sumAll = document.getElementById("summaryAll");
    const sumDone = document.getElementById("summaryDone");
    const sumPending = document.getElementById("summaryPending");

    if (sumAll) sumAll.innerHTML = `${t.summaryAll}: <span id="totalTasksCount">${tasks.length}</span>`;
    if (sumDone) sumDone.innerHTML = `${t.summaryDone}: <span id="doneTasksCount">${tasks.filter(x => Number(x.is_done) === 1).length}</span>`;
    if (sumPending) sumPending.innerHTML = `${t.summaryPending}: <span id="pendingTasksCount">${tasks.filter(x => Number(x.is_done) === 0).length}</span>`;

    setText("emptyTitle", t.emptyTitle);
    setText("emptyDesc", t.emptyDesc);

    setText("mTitle", editId ? t.mTitleEdit : t.mTitleAdd);
    setText("labelTaskName", t.labelTaskName);
    setText("labelTaskDay", t.labelTaskDay);
    setText("labelTaskTime", t.labelTaskTime);
    setText("labelTaskIcon", t.labelTaskIcon);
    setText("mSave", t.mSave);
    setText("mCancel", t.mCancel);

    const daySelect = document.getElementById("taskDay");
    if (daySelect) {
        [...daySelect.options].forEach((option, index) => {
            option.text = t.dayOptions[index];
        });
    }

    const iconSelect = document.getElementById("taskIcon");
    if (iconSelect) {
        [...iconSelect.options].forEach((option, index) => {
            option.text = t.iconOptions[index];
        });
    }

    renderTasks();
}

/*
    تجهيز الفلاتر
*/
function setupFilters() {
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
}

/*
    هنا جهزنا السحب والإفلات
    حتى المستخدم يقدر يرتب المهام كما يريد
*/
function setupDragAndDrop() {
    const cards = document.querySelectorAll(".task-card");
    const container = document.getElementById("taskGrid");
    if (!container) return;

    let dragged = null;

    cards.forEach(card => {
        card.addEventListener("dragstart", () => {
            dragged = card;
            card.classList.add("dragging");
        });

        card.addEventListener("dragend", async () => {
            card.classList.remove("dragging");
            dragged = null;

            const ids = [...container.querySelectorAll(".task-card")].map(c => Number(c.dataset.id));

            try {
                const result = await apiRequest("reorder", { ordered_ids: ids });
                if (result.success) {
                    await loadTasks();
                }
            } catch (e) {
                console.error(e);
            }
        });

        card.addEventListener("dragover", (e) => {
            e.preventDefault();

            const afterElement = getDragAfterElement(container, e.clientY);
            if (!dragged) return;

            if (afterElement == null) {
                container.appendChild(dragged);
            } else {
                container.insertBefore(dragged, afterElement);
            }
        });
    });
}

/*
    هذه دالة مساعدة لمعرفة أين سنضع الكرت أثناء السحب
*/
function getDragAfterElement(container, y) {
    const elements = [...container.querySelectorAll(".task-card:not(.dragging)")];

    return elements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }

        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

/*
    أول تحميل للصفحة
*/
document.addEventListener("DOMContentLoaded", async () => {
    setupFilters();

    const searchInput = document.getElementById("taskSearch");
    if (searchInput) {
        searchInput.addEventListener("input", renderTasks);
    }

    await loadTasks();
    applyLanguage();
});

/*
    هنا عرضنا الدوال على window
    لأن عندنا onclick داخل tasks.php
*/
window.openTaskModal = openTaskModal;
window.closeTaskModal = closeTaskModal;
window.saveTask = saveTask;
window.toggleDone = toggleDone;
window.editTask = editTask;
window.deleteTask = deleteTask;