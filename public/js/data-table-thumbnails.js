let DataThumbnail = function(p){

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
    this.pageSize = p.pageSize || 4;
    this.pageCount = 0;
    this.currentPage = p.startPage || 1;
    this.data = [];
    this.countField = p.countField;
    this.dataField = p.dataField;
    this.url = p.url;
    this.template = p.template;
    this.noDataFound = p.noDataFound;

    this.loadMore = undefined;

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

            if(this.loadMore)
            this.loadMore.innerHTML = `<div class="spinner-border" role="status" style="width: 1.2rem;height: 1.2rem;border: .15em solid currentColor;border-right-color: transparent;">
                                            <span class="visually-hidden"></span>
                                        </div><span style="padding:0 10px">Load More</span>`;
                
        fetch(actionUrl)
            .then(res => res.json())
            .then(json => {
                if(this.loadMore)
                this.loadMore.innerHTML = 'Load More';
                
                this.tableLoading.innerHTML = '';
                let data = json['data'][this.dataField];
                if(data && data.length > 0){
                    data.map(d => this.data.push(d))
                }
                this.count = parseInt(json['data'][this.countField]);
                this.drawTable();
                this.drawPagination();
                this.validationPagination()
            }).catch(err => {
                if(this.loadMore)
                this.loadMore.innerHTML = 'Load More';
            })
    }

    
    this.drawPagination = () => {
        
        this.tableControlsContainer.innerHTML = '';
        this.pageCount = Math.ceil(this.count/this.pageSize);
        
        let pagination = `<p class="text-center"><button class="btn btn-red" id="sk-${p.id}-pagination-load-more">Load More</button></p>`;

        this.drawTable();
        this.tableControlsContainer.innerHTML = pagination;
        this.loadMore = document.getElementById(`sk-${p.id}-pagination-load-more`);

        this.initPaginationAction();
    }

    this.drawTable = () => {
        this.tableContainer.innerHTML = '';

        let thumbnails = this.data.map(ob => `<div class="col-sm-3">${this.template.component(ob)}</div>`).join('');
        
        
        let table = `<div class="row">
                        ${thumbnails}
                     </div>
                     <div class="row">
                        <div class="col-md-12">
                            <div id="${p.id}-pagination-control"></div>
                        </div>
                    </div>
                     `;
        if(this.data && this.data.length > 0)
            this.tableContainer.innerHTML = table;
        else 
            this.tableContainer.innerHTML = this.noDataFound;

    }
    
    let nextPage = (e) => {
        e.preventDefault();
        this.currentPage = this.currentPage + 1;
        this.action();
    }

    this.initPaginationAction = () => {
        if(this.loadMore){
            if(this.currentPage < this.pageCount){
                this.loadMore.addEventListener('click', nextPage);
            }
        }
    }

        this.validationPagination = () => {
            if(this.loadMore){
                if(this.currentPage >= this.pageCount){
                    this.loadMore.classList.add('d-none');
                } else {
                    this.loadMore.classList.remove('d-none');
                }
            }
        }


        this.action();

        return {
            reload : this.action
        };
}
