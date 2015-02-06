Grid = function(){
    this.ITEMS_IN_ROW = 7;
    this.ITEMS_IN_COLUMN = 3;
    Main.filter.limit = this.ITEMS_IN_ROW * this.ITEMS_IN_COLUMN;

    this.displayPage = function() {
        Main.showTint('spinner');
        Main.resource.fetchPage(this.renderPage.bind(this), Main.showError);
    };

    this.renderPage = function(rawItems) {
        dbg('Grid.renderPage');
        var pageItems = this.prepareItemsForGrid(rawItems);
        this.renderGrid(pageItems);
        Main.hideTint();
    };

    this.prepareItemsForGrid = function(rawItems) {
        var gridItems = [];
        for (var i = 0; i < rawItems.length; i++) {
            var item = rawItems[i];
            if (item != undefined && item.poster == undefined) {
                item.poster = 'res/placeholder.png';
            }
            gridItems.push(item);
        }

        return gridItems;
    };

    this.renderGrid = function(items) {
        dbg('Grid.renderGrid');
        var gridContainer = document.getElementById('grid_container');
        gridContainer.innerHTML = '';
        var itemRow, i, item, itemWrapper, itemDiv, ratingComments, ratingCommentsText;
        for (var row = 0; row < this.ITEMS_IN_COLUMN; row++) {
            itemRow = document.createElement('div');
            itemRow.className = 'main-content-row';
            for (var col = 0; col < this.ITEMS_IN_ROW; col++) {
                i = row * this.ITEMS_IN_ROW + col;
                item = items[i];

                itemWrapper = document.createElement('div');
                itemWrapper.className = 'main-content-cell';
                itemDiv = document.createElement('div');
                itemWrapper.appendChild(itemDiv);

                if (item != undefined) {
                    itemDiv.dataset.infoUrl = item.url;
                    itemDiv.dataset.title = '[' + item.year + '] ' + item.title;
                    if (item.placeholder == undefined) {
                        itemDiv.className = 'main-content-item';
                        itemDiv.addEventListener('click', this.showVideoDetails.bind(this), false);
                        itemDiv.addEventListener('mouseenter', this.showTitle.bind(this), false);
                        itemDiv.addEventListener('mouseleave', this.hideTitle.bind(this), false);
                    }
                    itemDiv.style.backgroundImage = 'url(' + item.poster + ')';
                    ratingComments = document.createElement('div');
                    ratingComments.className = 'rating-comments-overlay';
                    ratingCommentsText = document.createTextNode('Рейтинг: ' + item.rating + ' Отзывов: ' + item.comments + ' Просм.:' + item.views);
                    ratingComments.appendChild(ratingCommentsText);
                    itemDiv.appendChild(ratingComments);
                } else {
                    itemDiv.className = 'main-content-placeholder';
                }
                itemRow.appendChild(itemWrapper);
            }
            gridContainer.appendChild(itemRow);
        }
    };

    this.showTitle = function(event) {
        var element = event.currentTarget;
        title = element.dataset.title;
        document.getElementById('title_placeholder').innerHTML = title;
    };

    this.hideTitle = function() {
        document.getElementById('title_placeholder').innerHTML = '';
    };

    this.showVideoDetails = function(event) {
        Main.showTint('spinner');
        var item = event.target;
        var url = item.dataset.infoUrl;
        Main.resource.fetchItem(url, this.renderVideoDetails.bind(this));
    };

    this.closeVideoDetails = function() {
        document.getElementById('info_panel').style.display = 'none';
    };

    this.renderVideoDetails = function(info) {
        // TODO replace with widget innerHTML
        document.getElementById('video_buttons').innerHTML = '';
        document.getElementById('info_poster').style.backgroundImage = 'url(' + info.poster + ')';
        document.getElementById('info_title').textContent = info.title;
        document.getElementById('info_about').textContent = info.about;
        document.getElementById('info_year').textContent = 'Год:' + info.year;
        document.getElementById('info_country').textContent = 'Страна:' + info.country;
        document.getElementById('info_duration').textContent = 'Длительность:' + info.duration;

        var videoButton = document.createElement('button');
        videoButton.className = 'tint-button video-button';
        var videoTitle = document.createElement('span');
        var videoTitleText = document.createTextNode('video');

        videoTitle.appendChild(videoTitleText);
        videoButton.appendChild(videoTitle);
        videoButton.dataset.url = info.video;
        videoButton.dataset.itemTitle = info.title;
        videoButton.addEventListener('click', this.playVideo.bind(this));
        document.getElementById('video_buttons').appendChild(videoButton);

        if (info.hdvideo != undefined) {
            var hdVideoButton = document.createElement('button');
            hdVideoButton.className = 'tint-button video-button';
            var hdVideoTitle = document.createElement('span');
            var hdVideoTitleText = document.createTextNode('HD');

            hdVideoTitle.appendChild(hdVideoTitleText);
            hdVideoButton.appendChild(hdVideoTitle);
            hdVideoButton.dataset.url = info.hdvideo;
            hdVideoButton.dataset.itemTitle = info.title;
            hdVideoButton.addEventListener('click', this.playVideo.bind(this));
            document.getElementById('video_buttons').appendChild(hdVideoButton);
        }

        Main.replaceTintWith('tint_info');
    };

    this.playVideo = function(event){
        var e = event.currentTarget;
        var url = e.dataset.url;
        Player.curItemTitle = e.dataset.itemTitle;
        Player.playVideo(url);
    };

    this.nextPage = function() {
        Main['filter']['page']++;
        Main.grid.displayPage();
    };

    this.prevPage = function() {
        Main['filter']['page'] = (Main['filter']['page'] - 1 < 0) ? 0 : Main['filter']['page'] - 1;
        Main.grid.displayPage();
    };
};

