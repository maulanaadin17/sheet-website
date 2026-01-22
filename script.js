const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSTfwyjEDnf4Rps3kYqtrntUl8VMkWvur_Uz7iwRZAyfp8E-7DFLFGGnHHYwHQINdyEz7dqGCRNm9ue/pub?gid=0&single=true&output=csv";
const rowsPerPage = 15;

let allRows = [];
let filteredRows = [];
let currentPage = 1;
let headers = [];

fetch(sheetURL)
  .then(res => res.text())
  .then(data => {
    const rows = data.split("\n").map(r => r.split(","));
    headers = rows[0];
    allRows = rows.slice(1);
    initFilters();
    applyFilters();
  });

function initFilters() {
  fillSelect("filterMonth", 0);
  fillSelect("filterSubjek", 2);
  fillSelect("filterStatus", 6);

  document.querySelectorAll("select, #searchInput")
    .forEach(el => el.addEventListener("change", applyFilters));
}

function fillSelect(id, index) {
  const select = document.getElementById(id);
  const values = [...new Set(allRows.map(r => r[index]).filter(Boolean))];
  values.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    select.appendChild(opt);
  });
}

function applyFilters() {
  const month = filterMonth.value;
  const subjek = filterSubjek.value;
  const status = filterStatus.value;
  const keyword = searchInput.value.toLowerCase();

  filteredRows = allRows.filter(r =>
    (!month || r[0] === month) &&
    (!subjek || r[1] === subjek) &&
    (!status || r[6] === status) &&
    r.join(" ").toLowerCase().includes(keyword)
  );

  currentPage = 1;
  renderTable();
}

function renderTable() {
  const thead = document.querySelector("thead");
  const tbody = document.querySelector("tbody");
  tbody.innerHTML = "";

  thead.innerHTML =
    "<tr>" + headers.map(h => `<th>${h}</th>`).join("") + "</tr>";

  const start = (currentPage - 1) * rowsPerPage;
  const pageRows = filteredRows.slice(start, start + rowsPerPage);

  pageRows.forEach(row => {
    let tr = "<tr>";
    row.forEach(col => {
      if (col.startsWith("http")) {
        tr += `<td><a href="${col}" class="link-btn" target="_blank">Buka</a></td>`;
      } else {
        tr += `<td>${col}</td>`;
      }
    });
    tr += "</tr>";
    tbody.innerHTML += tr;
  });

  updatePagination();
}

function updatePagination() {
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage);
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;

  prevPage.disabled = currentPage === 1;
  nextPage.disabled = currentPage === totalPages;
}

prevPage.onclick = () => {
  currentPage--;
  renderTable();
};

nextPage.onclick = () => {
  currentPage++;
  renderTable();
};

