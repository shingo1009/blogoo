/* ===================================================================

 * ロールオーバー

=================================================================== */
$.fn.rollover = function() {
    return this.each(function() {
        // 画像名を取得
        var src = $(this).attr('src');
        //すでに画像名に「_on.」が付いていた場合、ロールオーバー処理をしない
        if (src.match('_on.')) return;
        // ロールオーバー用の画像名を取得（_onを付加）
        var src_on = src.replace(/^(.+)(\.[a-z]+)$/, "$1_on$2");
        // 画像のプリロード（先読み込み）
        $('').attr('src', src_on);
        // ロールオーバー処理
        $(this).hover(
            function() { $(this).attr('src', src_on); },
            function() { $(this).attr('src', src); }
        );
    });
};


/* ===================================================================

 * ページトップへの戻り

=================================================================== */
$(function(){
    // スクロールすると表示するエリア
    var element = $('#pageTop');
    // スクロール量の設定
    var position = 400; // 単位：px
    // スクロールすると表示するエリアを非表示
    element.hide();
    $(window).scroll(function(){
        // スクロールすると表示させる
        if ($(this).scrollTop() > position) {
            $(element).fadeIn();
        } else {
            $(element).fadeOut();
        }
    });
});


/* ===================================================================

 * スムーススクロール

=================================================================== */
$(function(){
    // #で始まるアンカーをクリックした場合に処理
    $('a[href^=#]').click(function() {
        // スクロールの速度
        var speed = 400;// ミリ秒
        // アンカーの値取得
        var href= $(this).attr("href");
        // 移動先を取得
        var target = $(href == "#" || href == "" ? 'html' : href);
        // 移動先を数値で取得
        var position = target.offset().top;
        // スムーススクロール
        $('body,html').animate({scrollTop:position}, speed, 'swing');
        return false;
    });
});


/* ===================================================================

 * スライドショー

=================================================================== */
$.fn.slideshow = function (options) {
    // 初期値
    var o = $.extend({
        autoSlide    : true,
        type         : 'repeat',
        interval     : 3000,
        duration     : 500,
        easing       : 'swing',
        imgHoverStop : true,
        navHoverStop : true,
        eleClone     : 2,
        prevPosition : 0,
        nextPosition : 0
    }, options);

    // セレクタ設定
    var $slider     = $(this),
        $container  = $slider.find('.slideInner'),
        $element    = $container.children(),
        $prevNav    = $slider.find('.slidePrev'),
        $nextNav    = $slider.find('.slideNext'),
        $prevImg    = $slider.find('.slidePrev img'),
        $nextImg    = $slider.find('.slideNext img'),
        $controlNav = $slider.find('.controlNav');

    // 変数設定
    var windowWidth,
        slideWidth,
        totalWidth,
        slidePosition,
        filterWidth,
        filterHeight,
        imgMargin,
        imgPadding,
        prevImgWidth,
        prevImgPosition,
        nextImgWidth,
        nextImgPosition,
        count = 1,
        imgNum = 1,
        slideCount = 1,
        stopFlag = false;

    // フィルター設置
    $slider.append('<div class="filterPrev"></div><div class="filterNext"></div>');
    var $filterPrev = $slider.find('.filterPrev'),
        $filterNext = $slider.find('.filterNext');
    slideWidth = $element.outerWidth(true);

    // 読み込み時の設定
    $(window).on('load resize', function(){
        windowWidth = $(window).width();
        totalWidth = ($element.length * slideWidth) * Math.pow(2, o.eleClone);
        imgMargin = parseInt($element.find('img').css('margin-left'));
        imgPadding = parseInt($element.find('img').css('padding-left'));
        slidePosition = ((windowWidth - totalWidth ) / 2) - (slideWidth / 2);
        filterWidth = ((windowWidth - slideWidth) / 2) - (imgMargin + imgPadding);
        filterHeight = $element.height();
        prevImgWidth = $prevImg.width();
        prevImgPosition = filterWidth - prevImgWidth + o.prevPosition;
        nextImgWidth = $nextImg.width();
        nextImgPosition = filterWidth - nextImgWidth + o.nextPosition;

        if (o.type == 'stop') {
            $prevNav.hide();
        }

        // CSS
        $slider.css({
            'width' : 100 + '%',
            'height' : filterHeight
        });
        $container.css({
            'float' : 'left',
            'width' : totalWidth,
            'top'   : '0',
            'left'  : slidePosition
        });
        $element.css({'width' : slideWidth , 'height' : filterHeight});
        $prevNav.css({'left' : prevImgPosition});
        $nextNav.css({'right' : nextImgPosition});
        $filterPrev.css({'width' : filterWidth , 'height' : filterHeight});
        $filterNext.css({'width' : filterWidth , 'height' : filterHeight});
    });

    // スライド画像設定
    $container.css('width',totalWidth + 'px');
    for(i=0; i<o.eleClone; i++){
        $('li', $container).clone().appendTo($container);
    }
    $('li:last-child', $container).prependTo($container);
    $container.css('margin-left',-slideWidth + 'px');

    // コントールナビデザイン
    var controlNavDesign = function () {
        if(count > 0) {
            imgNum = count % $element.length;
        }
        if(count < 1) {
            imgNum = (count % $element.length) + $element.length;
        }
        if(imgNum == 0) {
            imgNum = $element.length;
        }
        $controlNav.children('span').removeClass('current');
        $controlNav.children('span:eq(' + (imgNum -1) + ')').addClass('current');
    };

    // 自動切り替えスタート
    var start;
    var startTimer = function () {
        start = setInterval(function(){
            nextSlide();
        },o.interval);
    };

    // 自動切り替えストップ
    var stopTimer = function () {
         clearInterval(start);
    };

    // ストップ機能
    var slideStop = function () {
        if (o.type == 'stop') {
            if(count >= $element.length){
                $nextNav.hide();
                stopTimer();
                stopFlag = true;
            }else{
                $nextNav.show();
            }
            if(count == 1){
                $prevNav.hide();
            }else{
                $prevNav.show();
            }
        }
    };

    // アニメーション時無効化
    var clear = function () {
        if($container.is(':animated')) { return false; }
        if($element.is(':animated')) { return false; }
    };

    // 左方向スライド
    var prevSlide = function () {
        clear();
        $container.not(':animated').animate({
            marginLeft:parseInt($container.css('margin-left')) + slideWidth + 'px'
        },o.duration,o.easing,
        function(){
            $('li:last-child', $container).prependTo($container);
            $container.css('margin-left',-slideWidth + 'px');
        });
        count--;
        controlNavDesign();
        slideStop();
    }

    // 右方向スライド
    var nextSlide = function () {
        clear();
        $container.not(':animated').animate({
            marginLeft:parseInt($container.css('margin-left')) -slideWidth + 'px'
        },o.duration,o.easing,
        function(){
            $('li:first-child', $container).appendTo($container);
            $container.css('margin-left',-slideWidth + 'px');
        });
        count++;
        controlNavDesign();
        slideStop();
    }

    // 戻るボタン
    $prevNav.click(function(){
        prevSlide();
   });

    // 進むボタン
    $nextNav.click(function(){
        nextSlide();
    });

    // コントローラーの生成
    $element.each(function (e) {
        $('<span/>').text(e + 1).appendTo($controlNav)
        .click(function () {
            clear();
            if(count > 0) {
                imgNum = count % $element.length;
            }
            if(count < 1) {
                imgNum = (count % $element.length) + $element.length;
            }
            if(imgNum == 0) {
                imgNum = $element.length;
            }
            if((e + 1) == imgNum) { return false; }
            // 左方向スライド
            if((e + 1) < imgNum) {
                slideCount = imgNum - (e + 1);
                $container.not(':animated').animate({
                    marginLeft:parseInt($container.css('margin-left')) + (slideWidth * slideCount) + 'px'
                },o.duration,o.easing,
                function(){
                    for(i=0; i < slideCount; i++){
                        $('li:last-child', $container).prependTo($container);
                    }
                    $container.css('margin-left',-slideWidth + 'px');
                });
                count = count - slideCount;
                controlNavDesign();
                slideStop();
            }
            // 右方向スライド
            if((e + 1) > imgNum) {
                slideCount = (e + 1) - imgNum;
                $container.not(':animated').animate({
                    marginLeft:parseInt($container.css('margin-left')) - (slideWidth * slideCount) + 'px'
                },o.duration,o.easing,
                function(){
                    for(i=0; i < slideCount; i++){
                        $('li:first-child', $container).appendTo($container);
                    }
                    $container.css('margin-left',-slideWidth + 'px');
                });
                count = count + slideCount;
                controlNavDesign();
                slideStop();
            }
        });
    });
    $controlNav.find('span:first-child').addClass('current');

    // ホバー時に画像静止（自動切り替えストップ）
    if(o.imgHoverStop){
        $container.hover(
            function () {
                stopTimer();
            },
            function () {
                if(stopFlag || !o.autoSlide) {
                    stopTimer();
                }else {
                    startTimer();
                }
            }
        );
    }

    // ナビゲーションのホバー動作
    if(o.navHoverStop){
        $prevNav.hover(
            function () {
                stopTimer();
            },
            function () {
                if(stopFlag || !o.autoSlide) {
                    stopTimer();
                }else {
                    startTimer();
                }
            }
        );
        $nextNav.hover(
            function () {
                stopTimer();
            },
            function () {
                if(stopFlag || !o.autoSlide) {
                    stopTimer();
                }else {
                    startTimer();
                }
            }
        );
        $controlNav.hover(
            function () {
                stopTimer();
            },
            function () {
                if(stopFlag || !o.autoSlide) {
                    stopTimer();
                }else {
                    startTimer();
                }
            }
        );
    }

    // 自動スタート設定
    if(o.autoSlide){
        startTimer();
    }

};

/* ===================================================================

 * コンテンツの高さを揃える

=================================================================== */
$.fn.uniformHeight = function() {
    var maxHeight = 0;
    this.each(function() {
        var thisHeight = $(this).height();
        if(thisHeight > maxHeight){
            maxHeight = thisHeight;
        }
    });
    $(this).height(maxHeight);
};
