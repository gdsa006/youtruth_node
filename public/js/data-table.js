let DataTable = function(p){

    let loading = `
    <div class="my-4">
        <center>
            <div class="spinner-border" role="status">
                <span class="visually-hidden"></span>
            </div>
            <span style="font-size: 16px;padding: 0px 10px;">Loading...</span>
        </center>
    </div>
    `;
    let container = document.getElementById(p.id);
    container.style.position ='relative';
    
    let tableLoading = document.createElement('div');
    tableLoading.innerHTML = loading;
    tableLoading.id=`${p.id}-table-loading`;

    let tableContainer = document.createElement('div');
    tableContainer.id=`${p.id}-table-container`;

    let tableControlsContainer = document.createElement('div');
    tableControlsContainer.id=`${p.id}-table-controls-container`;

    this.count = 0;
    this.pageSize = p.pageSize || 5;
    this.pageCount = 0;
    this.currentPage = p.startPage || 1;
    this.data = [];
    this.countField = p.countField;
    this.dataField = p.dataField;
    this.url = p.url;
    this.cols = p.cols;
    this.showTableHead = p.showTableHead || 'show';
    this.noDataFound = p.noDataFound;

    this.prevBtn = undefined;
    this.nextBtn = undefined;
    this.goToPageBtns = undefined;

    this.container = container;
    this.tableLoading = tableLoading;
    this.tableContainer = tableContainer;
    this.tableControlsContainer = tableControlsContainer;


    
    this.container.appendChild(tableLoading);
    this.container.appendChild(tableContainer);
    this.container.appendChild(tableControlsContainer);

    this.action = () => {
        this.tableLoading.innerHTML = loading;
        
        let url = this.url.split('?')
        let actionUrl = '';

        if(url.length > 1)
            actionUrl = `${url[0]}?page=${this.currentPage}&size=${this.pageSize}&${url[1]}`;
        else 
            actionUrl = `${this.url}?page=${this.currentPage}&size=${this.pageSize}`;

        fetch(actionUrl)
            .then(res => res.json())
            .then(json => {
                this.tableLoading.innerHTML = '';
                this.data = json['data'][this.dataField];
                this.count = parseInt(json['data'][this.countField]);
                this.drawTable();
                this.drawPagination();
                this.validationPagination()
            })
    }

    
    this.drawPagination = () => {
        
        this.tableControlsContainer.innerHTML = '';

        let pageBtn = (index) => `<li class="page-item ${this.currentPage == index ? 'active' : ''}"><a class="page-link ${p.id}-go-to-page" href="#" data-go-to-page="${index}">${index}</a></li>`;
        let pageBtns = [];

        this.pageCount = Math.ceil(this.count/this.pageSize);
        let start = this.currentPage - 2 ;
        for(let i=start;i<= this.pageCount; i++)
            if(i > 0 && pageBtns.length <5)
                pageBtns.push(pageBtn(i)); 

        

        let pagination = `<nav class="${ !this.data || this.data.length == 0 ? 'd-none':''}">
                            <ul class="pagination justify-content-center">
                                <li class="page-item" id="sk-${p.id}-pagination-prev"><a class="page-link" href="#">Previous</a></li>
                                ${pageBtns.join('')}
                                <li class="page-item" id="sk-${p.id}-pagination-next"><a class="page-link" href="#">Next</a></li>
                            </ul>
                         </nav>`;

        this.drawTable();
        this.tableControlsContainer.innerHTML = pagination;
        this.next = document.getElementById(`sk-${p.id}-pagination-next`);
        this.prev = document.getElementById(`sk-${p.id}-pagination-prev`);
        this.goToPageBtns = document.getElementsByClassName(`${p.id}-go-to-page`);

        this.initPaginationAction();
    }

    this.drawTable = () => {
        this.tableContainer.innerHTML = '';
        let headRow = ('<tr>').concat(Object.keys(this.cols).map(k => `<th>${this.cols[k].alias}</th>` ).join('')).concat('</tr>');
        let bodyRow = this.data.map(r => {
            return ('<tr>').concat(Object.keys(this.cols).map(k => {
                let td = ``;
                if(this.cols[k].html){
                    td = `<td>${this.cols[k].html(r)}</td>`;
                } else 
                    td = `<td>${r[k]}</td>`;

                return td;
            } ).join('')).concat('</tr>')
        }).join('');
        
        console.log(this.showTableHead)
        let table = `<table class="table border">${this.showTableHead == 'show' ? `<thead>${headRow}</thead>`:''}<tbody>${bodyRow}</tbody><table><div id="${p.id}-pagination-control"></div>`;
        if(this.data && this.data.length > 0)
            this.tableContainer.innerHTML = table;
        else 
            this.tableContainer.innerHTML = this.noDataFound ? this.noDataFound : '<p class="text-center alert alert-danger"> NO DATA FOUND ! </p>';

    }
    
    let nextPage = (e) => {
        e.preventDefault();
        this.currentPage = this.currentPage + 1;
        this.action();
    }

    let prevPage = (e) => {
        e.preventDefault();
        this.currentPage = this.currentPage - 1;
        this.action()
    }

    this.initPaginationAction = () => {
        for(let i=0; i < this.goToPageBtns.length ; i++)
        this.goToPageBtns[i].addEventListener('click', (e) => {
            e.preventDefault();
            this.currentPage = parseInt(e.target.dataset.goToPage);
            this.action()
        });
        
        if(this.currentPage < this.pageCount)
        this.next.addEventListener('click', nextPage);
        if(this.currentPage > 1)
        this.prev.addEventListener('click', prevPage)
    }

        this.validationPagination = () => {
            if(this.currentPage > 1){
                this.prev.classList.remove('disabled');
                this.prev.disabled = '';
            } else {
                this.prev.disabled = 'disabled';
                this.prev.classList.add('disabled');
            }
            if(this.currentPage >= this.pageCount){
                this.next.disabled = 'disabled';
                this.next.classList.add('disabled');
            } else {
                this.next.disabled = ''
                this.next.classList.remove('disabled');
            }
        }


        this.action();

        return {
            reload : () => {
                this.action();
            },
            reloadByUrl : (url) => {
                if(this.url)
                    this.url = url;
                this.action();
            }
        };
}
