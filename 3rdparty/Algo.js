( function( $ ) {
	'use strict';
	var $body            = $( 'body' );
	var $tables          = $( '.stock-table' );
	var $tabContent      = $( '.condition__tab-content' );
	var modals           = [ 'filter', 'chi-so', 'backtest','chitiet-backtest' ];
	var toggleClassItems = [ '.nav-tab', '.market__sub__link' ];
	var $fixedComponents = $( '.fixed-components' );
	var $chartArea       = $( '.chart-area' );
	var $tablesWrapper   = $( '.stock-tables__table' );
	var $stockHeaderNav  = $( '.stock-header__navigation' );
	var $window          = $( window );

	// Default values
	cssVars({
		// Targets
		rootElement   : document,
		shadowDOM     : false,

		// Sources
		include       : 'link[rel=stylesheet],style',
		exclude       : '',
		variables     : {},

		// Options
		onlyLegacy    : true,
		preserveStatic: true,
		preserveVars  : false,
		silent        : false,
		updateDOM     : true,
		updateURLs    : true,
		watch         : false,
	});


	/**
	 * Sticky Header
	 */
	var stickyHeader = function() {
		var $tableHeader = $( '.table--active .table__header ' ),
			fixedComponentsHeight = Math.floor( $fixedComponents.outerHeight() ),
			$financeHeader = $( '.code-details .tc__header' );

		$tableHeader.css( 'top', fixedComponentsHeight + 'px' );
		stickybits( $tableHeader, { stickyBitStickyOffset: fixedComponentsHeight } );
		$tablesWrapper.css( 'margin-top', fixedComponentsHeight + 'px' );
		$financeHeader.css( 'top', fixedComponentsHeight + 'px' );
	};

	$stockHeaderNav.on( 'click', '.dropdown-menu a', function() {
		$( '.nav-tab' ).removeClass( 'active' );
		$( this ).closest( '.dropdown' ).find( '.nav-tab' ).addClass( 'active' );
	} );

	/**
	 * Xử lý khi lưu kết quả lọc
	 */
	$( '.filter__buttons' ).find( 'button:first' ).on( 'click', function() {
		// Save tên bộ lọc.
		var filterName = $( '.filter__name input').val();
		if ( filterName == '' ) {
			alert( 'Xin hãy nhập tên bộ lọc' );
			return;
		}
		addNewFilter( filterName );

		// Ẩn modal
		handleHideModals();

		// Hiển thị kết quả lọc.
		showFilterResult();
	} );

	function addNewFilter( filterName ) {
		if ( $( '.modal--filter' ).attr( 'data-modal-edit' ) ) {
			return;
		}
		var newItem = '\
			<li class="list__item">\
				<span class="list__name txt-white"><span>' + filterName + '</span></span>\
				<input class="is-hidden" type="text">\
				<span class="list__buttons">\
					<a class="txt-white btn--edit" href="#" title="Sửa"><i class="fas fa-edit"></i></a>\
					<a class="txt-white btn--delete" href="#" title="Xóa"><i class="fas fa-times"></i></a>\
				</span>\
			</li>\
		';
		$( '.dropdown-menu--loc' ).find( 'ul' ).append( newItem );
	}

	function showFilterResult() {
		$tables.removeClass( 'table--active' );
		$( '#ket-qua-loc' ).addClass( 'table--active' );
		$( '.visble-on-filter' ).removeClass( 'is-hidden' );
		$( '.stock-header__view-mode' ).addClass( 'is-hidden' );
		stickyHeader();
	}

	tippy( '.tooltip', {
		arrow: true,
		placement: 'top',
		size: 'large',
		theme: 'google',
	} );

	function toggleTables() {
		$body.on( 'click', '.has-table', function( e ) {
			e.stopPropagation();
			e.preventDefault();
			var href = $( this ).attr( 'href' );
			if ( -1 !== ['#thoa-thuan', '#khuyen-nghi', '#bang-gia', '#co-ban'].indexOf( href ) ) {
				$( '.stock-header__view-mode a' )
					.removeClass( 'active' )
					.removeAttr( 'href' )
					.css( 'pointer-events', 'none' );
				$( '.visble-on-filter' ).addClass( 'is-hidden' );
			}

			if ( href === '#thoa-thuan' ) {
				$( '.ty-gia' ).text( 'Giá x 1000 VND. Khối lượng x 1 cổ phiếu' );
			}
			console.log($tables);
			console.log(href);
			$tables.removeClass( 'table--active' );
			$tables.filter( href ).addClass( 'table--active' );
			stickyHeader();
		} );
	}

	function toggleTab() {
		$body.on( 'click', '.tab__item', function( e ) {
			e.preventDefault();
			var $this = $( this );

			$this.siblings().removeClass( 'active' );
			$this.addClass( 'active' );
			$tabContent.removeClass( 'active' );
			$tabContent.filter( $this.attr( 'href' ) ).addClass( 'active' );
		} );
	}

	function toggleClassActive() {
		toggleClassItems.forEach( function( item ) {
			$body.on( 'click', item, function( e ) {
				e.preventDefault();
				var $this = $( this );
				console.log($this);
				$( item ).removeClass( 'active' );
				$this.addClass( 'active' );
			} );
		} );
	}

	/**
	 * Khởi tạo modals
	 */
	function initModals() {
		console.log('init modals' + modals);
		modals.forEach( function( modal ) {
            console.log('.init-' + modal + '-modal');
			$('.init-' + modal + '-modal').on( 'click', function( e ) {
				e.preventDefault();
				var edit = $( this ).attr( 'data-modal-edit' );
				$body.addClass( 'modal-' + modal + '-enable' );
				if ( edit ) {
					$( '.modal--filter' ).attr( 'data-modal-edit', 'enable' );
				}
				if ( 'filter' === modal ) {
					filterCondition.init( edit );
					renderCondition.handleTabContent();
				} else if ( 'chi-so' === modal ) {
					resetChiso();
				}
			} );
		} );
	}

	function handleHideModals() {
		$body.removeClass( function( index, className ) {
			return (className.match(/\bmodal-\S+/g) || []).join(' ');
		} );
	}

	/**
	 * Ẩn modal
	 */
	function hideModals() {
		$( '.modal__background, .modal__close, .modal__close--btn' ).on( 'click', function() {
			handleHideModals();
		} );
	}

	var renderCondition = {
		/**
		 * Xử lý phần lựa chọn condition
		 */
		handleTabContent: function() {
			$body.on( 'change', '.tab-content__item input', function() {
				var selected = $body.find( '.tab-content__item input:checked' );
				renderCondition.renderConditionItems( selected );
			} );
		},

		/**
		 * Render các condition trong phần edit khi lựa chọn xong.
		 */
		renderConditionItems: function() {
			var selected = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
			var $filterConditionWrap = $( '.filter__edit-condition' )
			var html = '';
			if ( ! selected ) {
				$filterConditionWrap.html( '' );
				return;
			};
			selected.each( function( index, input ) {
				var condition = $( input ).next( 'span' ).html();
				var id        = $( input ).prop( 'id' );
				html += '<div class="condition__item d-flex flex-wrap">\
							<div class="condition__edit">\
								<label class="custom-checkbox custom-checkbox--1">\
									<input checked type="checkbox" name="" value=""><span>' + condition + '</span>\
								</label>\
								<span class="remove" data-input="' + id + '"><i class="fas fa-times"></i></span>\
							</div>\
							<div class="condition__slider-wrapper d-flex flex-wrap">\
								<input type="number" name="low">\
								<div class="condition__slider"></div>\
								<input type="number" name="top">\
							</div>\
						</div>';
			} );
			$filterConditionWrap
				.html( html )
				.on( 'click', '.condition__item .remove', function() {
					var id = $( this ).data( 'input' );
					$( '#' + id ).prop( 'checked', false );
					$( this ).closest( '.condition__item' ).remove();
				} );
			renderCondition.initRangeSlider();
		},

		/**
		 * Tạo range slider sử dụng plugin nouislider.
		 */
		initRangeSlider: function() {
			var sliders = document.querySelectorAll( '.condition__slider' );
			// Không dùng forEach vì chậm và ie không hỗ trợ foreach.
			for( var i = 0, len = sliders.length; i < len; i++) {
				var slider = sliders[i];
				noUiSlider.create(slider, {
					start: [20, 300000],
					connect: true,
					format: {
						to: function (value) {
							return parseInt( value ).toFixed(0);
						},
						from: function (value) {
							return parseInt( value ).toFixed(0);
						}
					},
					range: {
						'min': 0,
						'max': 300000
					}
				} );
				renderCondition.updateSliderByInput( slider );
			};
		},
		updateSliderByInput: function( slider ) {
			var inputLow = slider.previousElementSibling;
			var inputTop = slider.nextElementSibling;

			slider.noUiSlider.on('update', function ( values, handle ) {
			    inputLow.value = values[ 0 ];
			    inputTop.value = values[ 1 ];
			} );

			inputLow.addEventListener( 'change', function() {
				slider.noUiSlider.set( [ this.value, null ] );
			} );
			inputTop.addEventListener( 'change', function() {
				slider.noUiSlider.set( [ null, this.value ] );
			} );
		}
	};

	var filterCondition = {
		$tabItems: $( '.tab__item' ),
		$tabContentItems: $( '.tab-content__item' ),
		init: function( edit ) {
			if ( edit !== 'enable' ) {
				filterCondition.handleResetByButton();
			}
			var timeout = null;
			$( '.input__search input' ).on( 'input', function() {
				var value = xoaDau( $( this ).val().toLowerCase() );
				if ( timeout ) {
					clearTimeout( timeout );
				}
				timeout = setTimeout( filterCondition.handle, 400, value );
			} );
			filterCondition.resetByButton();
		},
		handle: function( value ) {
			if ( value === '' ) {
				filterCondition.resetByKeyboard();
				return;
			}
			filterCondition.$tabContentItems.children( 'span' ).each( function() {
				var $this       = $( this );
				var $tabContent = $this.closest( '.tab-content__item' );
				var text        = xoaDau( $this.text().toLowerCase() );
				if ( text.indexOf( value ) !== -1 ) {
					$tabContent.addClass( 'is-visible' ).removeClass( 'is-hidden' );
				} else {
					$tabContent.removeClass( 'is-visible' ).addClass( 'is-hidden' );
				}
			} );
			var visibleItems = filterCondition.getVisibleConditionTabItems();

			// trước khi filter cho hiện hết các tabItems.
			filterCondition.$tabItems.removeClass( 'is-hidden' ).each( function() {
				var href = $( this ).attr( 'href' ).replace( '#', '' );
				var index = visibleItems.indexOf( href );
				if ( index === 0 ) {
					$( this ).addClass( 'active' ).trigger( 'click' );
				} else if ( index === -1 ) {
					$( this ).addClass( 'is-hidden' );
				}

			} );
		},
		/**
		 * Reset lại filter khi xóa, delete.
		 */
		resetByKeyboard: function() {
			filterCondition.$tabItems.removeClass( 'is-hidden active' );
			filterCondition.$tabContentItems.removeClass( 'is-hidden is-visible' );
			filterCondition.$tabItems.first().trigger( 'click' );
		},
		/**
		 * Reset lại filter sau khi nhấn nút.
		 */
		resetByButton: function() {
			$( '.buttons__reset' ).on( 'click', function() {
				filterCondition.handleResetByButton();
			} );
		},
		handleResetByButton: function() {
			$( '.tab-content__item input' ).prop( 'checked', false );
			$( '.input__selects select' ).val('');
			$( '.filter__inputs input' ).val('');
			$( '.filter__name input' ).val('');
			filterCondition.resetByKeyboard();
			renderCondition.renderConditionItems();
		},
		getVisibleConditionTabItems: function() {
			var visibleItems = [];
			$( '.condition__tab-content' ).each( function() {
				if ( $( this ).has( '.is-visible' ).length ) {
					var id = $( this ).prop( 'id' );
					visibleItems.push( id );
				}
			} );
			return visibleItems;
		},
	};

	function xoaDau( text ) {
		return text
			.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
			.replace(/đ/g, "d")
			.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y")
			.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u")
			.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o")
			.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
			.replace(/ì|í|ị|ỉ|ĩ/g,"i");
	}
	/**
	 * Reset lại filter sau khi nhấn nút.
	 */
	function resetChiso() {
		console.log('reset chi so');
		var $defaultCheck = $( '.chi-so-item' ).find( 'input[data-default]' );
		$( '#set-chi-so-default' ).on( 'click', function() {
			$( '.chi-so-item input' ).prop( 'checked', false );
			$defaultCheck.prop( 'checked', true );
		} );
	}


	/**
	 * Toggle giá trị td, th
	 */
	function toggleTableData() {
		$( '.has-toggle a' ).on( 'click', function( e ) {
			e.stopPropagation();
			var dataToggle = $( this ).attr( 'data-toggle' );
			if ( 'gia' === dataToggle ) {
				var current = $( '.has-toggle.toggle--gia' ).attr( 'colspan' );
				var $table = $( this ).closest( '.stock-table' );
				$table.toggleClass( 'is-hidden-gia' ); // Fix lỗi khi thêm toggle từ giá sang dư và thêm mã thì bị lệch
				$( '.has-toggle.toggle--gia' ).attr( 'colspan', current == 3 ? 2 : 3 );
				$( '.phai-sinh .item-info > td' ).attr( 'colspan', current == 3 ? 27: 28 );
				$( '.chung-quyen .item-info > td' ).attr( 'colspan', current == 3 ? 28: 29 );
			}
			$( '.toggle--' + dataToggle ).toggleClass( 'toggling' );
		} );
	}

	/**
	 * Edit list item
	 */
	function editListItem() {
		$body.on( 'click', '.btn--edit', function( e ) {
			e.preventDefault();
			var $this       = $( this );
			var $listItem   = $this.closest( '.list__item' );
			var $listName   = $listItem.find( '.list__name' ).toggleClass( 'is-hidden' );
			var $input      = $listItem.find( 'input' ).toggleClass( 'is-hidden' );
			var $textWrapper = $listName.find( 'span' );

			$input.val( $textWrapper.text() );

			$input.on( 'change', function( e ) {
				$textWrapper.text( e.target.value );
			} );

			$input.on( 'keypress', function( e ) {
				if ( e.which == '13' ) {
					$listName.removeClass( 'is-hidden' );
					$( this ).addClass( 'is-hidden' );
				}
			} )

		} );
	}

	/**
	 * Edit list item
	 */
	function deleteListItem() {
		$body.on( 'click', '.btn--delete', function( e ) {
			e.preventDefault();
			var $listItem = $( this ).closest( '.list__item' );
			$listItem.remove();
		} );
	}

	function createListItem() {
		$( '.danh-muc__tao-moi' ).on( 'submit', function( e ) {
			e.preventDefault();
			var $input = $( this ).find( 'input[type="text"' );
			var value = $input.val();
			var newItem = '\
				<li class="list__item">\
					<span class="list__name">\
						<i class="fas fa-check-circle"></i><span>' + value + '</span>\
					</span>\
					<input class="is-hidden" type="text">\
					<span class="list__buttons">\
						<a class="txt-white btn--edit" href="#" title="Sửa"><i class="fas fa-edit"></i></a>\
						<a class="txt-white btn--delete" href="#" title="Xóa"><i class="fas fa-times"></i></a>\
					</span>\
				</li>\
			';
			$( '.dropdown-menu__list' ).append( newItem );
			danhMucMoi.addAvailableDanhMuc();
			$input.val( '' );
		} )
	}

	function toggleChart() {
		$( '.stock-header__chart-toggle' ).on( 'click', function() {
			if ( $chartArea.hasClass( 'half-hidden' ) ) {
				$chartArea.removeClass( 'half-hidden' ).addClass( 'is-hidden' );
				$( this ).addClass( 'rotate-arrow' );
				stickyHeader();
				return;
			} else if ( $chartArea.hasClass( 'is-hidden' ) ) {
				$chartArea.removeClass( 'is-hidden' );
				$( this ).removeClass( 'rotate-arrow' );
				stickyHeader();
				return;
			}
			$chartArea.addClass( 'half-hidden' );
			stickyHeader();
		} );
	}

	function initChartSlider() {
		$( '.chart-area' ).removeClass( 'is-hidden' ).slick( {
			slidesToShow: 5,
			arrows: false,
			swipeToSlide: true,
			mobileFirst: false,
			responsive: [
				{
					breakpoint: 1024,
					settings: {
						slidesToShow: 5,
					}
				},
				{
					breakpoint: 768,
					settings: {
						slidesToShow: 5,
					}
				},
				{
					breakpoint: 480,
					settings: {
						slidesToShow: 5,
					}
				}
			]
		} );
	}

	function removeCode() {
		$body.on( 'click', '.txt-ma .remove', function( e ) {
			e.preventDefault();
			$( this ).closest( 'tr' ).remove();
		} );
	}

	var addCode = {
		codes: AV.StockBoard.companies,
		$input: null,
		init: function() {
			addCode.$input = $( '#add-code' );
			addCode.add();
			addCode.manualAdd();
			addCode.clickAdd();
		},

		add: function() {
			addCode.$input.autocomplete( {
				source: addCode.codes,
				select: function( event, ui ) {
					addCode.addToTable( ui.item );
				}
			} );
		},

		manualAdd: function() {
			addCode.$input.on( 'keypress', function( e ) {
				if ( e.which != 13 ) {
					return;
				}

				e.preventDefault();

				var code = addCode.$input.val().toLowerCase();
                console.log('manualAdd');
				var filtered = addCode.codes.filter( function( item ) {
                    //var symbol = $.trim((item.indexOf('-') == -1) ? item.toUpperCase() : item.substr(0, item.indexOf('-'))).toUpperCase();
					return item.value.toLowerCase().indexOf( code ) === 0;
				} );

                addCode.$input.val( '' );
                addCode.$input.autocomplete( 'close' );

				if ( filtered.length ) {
					addCode.addToTable( filtered[0] );
				}
			} );
		},

		clickAdd: function() {
			$( '#submit-code' ).on( 'click', function( e ) {
				e.preventDefault();
                console.log('clickAdd')
				var code = addCode.$input.val().toLowerCase();

                var filtered = addCode.codes.filter( function( item ) {
                    //var symbol = $.trim((item.indexOf('-') == -1) ? item.toUpperCase() : item.substr(0, item.indexOf('-'))).toUpperCase();
                    return item.value.toLowerCase().indexOf( code ) === 0;
                } );

                addCode.$input.val( '' );
                addCode.$input.autocomplete( 'close' );

                if ( filtered.length ) {
                    addCode.addToTable( filtered[0] );
                }
			} );
		},

		addToTable: function( item ) {
            $AV('StockBoard.Favourite.AddItem').addSymbol(item.value);
		}
	};

	var viewCode = {
		baseUrl: 'https://algoplatform.vn/banggia/security.aspx?id=',
		codes: AV.StockBoard.companies,
		$input: null,

		init: function() {
			viewCode.$input = $( '#view-code' );
			viewCode.search();
			viewCode.manualSearch();
		},

		search: function() {
			viewCode.$input.autocomplete( {
				source: viewCode.codes,
				select: function( event, ui ) {
                    var symbol = ui.item.value;
					window.location = viewCode.baseUrl + symbol;
				}
			} );
		},

		manualSearch: function() {
			viewCode.$input.on( 'keypress', function( e ) {
				console.log( e );
				if ( e.which != 13 ) {
					return;
				}

				e.preventDefault();

				var code = viewCode.$input.val().toLowerCase();

				var filtered = viewCode.codes.filter( function( item ) {
					return item.value.toLowerCase().indexOf( code ) === 0;
				} );

				if ( filtered.length ) {
					window.location = viewCode.baseUrl + filtered[0].value;
				}

				viewCode.$input.val( '' );
				viewCode.$input.autocomplete( 'close' );
			} );
		},

		clickSearch: function() {
			$( '#view-code-submit' ).on( 'click', function( e ) {
				e.preventDefault();

				var code = viewCode.$input.val().toLowerCase();

				var filtered = viewCode.codes.filter( function( item ) {
					return item.value.toLowerCase() === code;
				} );

				if ( filtered.length ) {
					window.location = viewCode.baseUrl + '?code=' + filtered[0].value;
				}

				viewCode.$input.val( '' );
				viewCode.$input.autocomplete( 'close' );
			} );
		}
	};


    var SortCodes = function ( selector, key ) {
        this.$el = $( selector );
        this.key = key;
    }
    SortCodes.prototype.sort = function() {
        var that = this;
        this.$el.sortable( {
            update: function( event, ui ) {
                var index = that.$el.find( 'tr' ).index( ui.item );
                ui.item.data( 'index', index );

                var order = JSON.parse( localStorage.getItem( that.key ) );
                order = order || {};

                // Push other codes down.
                Object.keys( order ).forEach( function( id ) {
                    if ( order[id] >= index ) {
                        order[id] = order[id] + 1;
                    }
                } );

                // Save index for current item.
                order[ui.item.data( 'id' )] = index;

                localStorage.setItem( that.key, JSON.stringify( order ) );
            }
        } );
    };
    SortCodes.prototype.refresh = function() {
        var that = this,
            order = JSON.parse( localStorage.getItem( that.key ) );

        order = order || {};

        Object.keys( order ).forEach( function( id ) {
            var $item = that.$el.find( '[data-id="' + id + '"]' );
            if ( ! $item.length ) {
                return;
            }
            $item.insertBefore( $item.siblings( ':eq(' + order[id] + ')' ) );
        } );
    };
    SortCodes.prototype.init = function() {
        this.sort();
        this.refresh();
    }

    var phaiSinh = {
        init: function() {
            phaiSinh.toggleItemInfo();
            phaiSinh.toggleTab();
            phaiSinh.toggleTabTable();
        },

        // Ẩn hiện thông tin chi tiết của mã trong màn hình bảng giá Phái sinh.
        toggleItemInfo: function() {
            var $info = $( '.phai-sinh .item-info' );
            $body.on( 'click', '.phai-sinh .item', function() {
                var $next = $( this ).next();
                $info.not( $next ).removeClass( 'is-active' );
                $next.toggleClass( 'is-active');
            } );
        },

        toggleTab: function() {
            $( '.phai-sinh .item-info__tabs' ).on( 'click', 'a', function( e ) {
                var $this = $( this );

                $this.siblings().removeClass( 'is-active' );
                $this.addClass( 'is-active' );

                var $tabs = $this.closest( '.item-info' ).find( '.item-info__tab' );
                $tabs.removeClass( 'is-active' );

                var href = $this.attr( 'href' );

                if ( -1 !== href.indexOf( '#' ) ) {
                    e.preventDefault();
                    $tabs.filter( '[data-tab="' + href + '"]').addClass( 'is-active' );
                }
            } );
        },

        toggleTabTable: function() {
            $( '.phai-sinh .item-info__sidebar__nav' ).on( 'click', 'a', function( e ) {
                e.preventDefault();

                var $this = $( this );
                $this.siblings().removeClass( 'is-active' );
                $this.addClass( 'is-active' );

                var $tabs = $this.closest( '.item-info' ).find( '.item-info__sidebar__tab' );
                $tabs.removeClass( 'is-active' );
                $tabs.filter( '[data-tab="' + $this.attr( 'href' ) + '"]').addClass( 'is-active' );
            } );
        }
    };

    var chungQuyen = {
        init: function() {
            chungQuyen.toggleItemInfo();
            chungQuyen.toggleTab();
            chungQuyen.toggleTabTable();
        },

        // Ẩn hiện thông tin chi tiết của mã trong màn hình bảng giá Phái sinh.
        toggleItemInfo: function() {
            var $info = $( '.chung-quyen .item-info' );
            $body.on( 'click', '.chung-quyen .item', function() {
                var $next = $( this ).next();
                $info.not( $next ).removeClass( 'is-active' );
                $next.toggleClass( 'is-active');
            } );
        },

        toggleTab: function() {
            $( '.chung-quyen .item-info__tabs' ).on( 'click', 'a', function( e ) {
                var $this = $( this );

                $this.siblings().removeClass( 'is-active' );
                $this.addClass( 'is-active' );

                var $tabs = $this.closest( '.item-info' ).find( '.item-info__tab' );
                $tabs.removeClass( 'is-active' );

                var href = $this.attr( 'href' );

                if ( -1 !== href.indexOf( '#' ) ) {
                    e.preventDefault();
                    $tabs.filter( '[data-tab="' + href + '"]').addClass( 'is-active' );
                }
            } );
        },

        toggleTabTable: function() {
            $( '.chung-quyen .item-info__sidebar__nav' ).on( 'click', 'a', function( e ) {
                e.preventDefault();

                var $this = $( this );
                $this.siblings().removeClass( 'is-active' );
                $this.addClass( 'is-active' );

                var $tabs = $this.closest( '.item-info' ).find( '.item-info__sidebar__tab' );
                $tabs.removeClass( 'is-active' );
                $tabs.filter( '[data-tab="' + $this.attr( 'href' ) + '"]').addClass( 'is-active' );
            } );
        }
    };

    var itemDetails = {
        init: function() {
            itemDetails.toggleMenu();
            itemDetails.selectMenuItem();
            itemDetails.toggleGiaoDichTabs();
            itemDetails.toggleSuKienTabs();
            itemDetails.initGiaoDichDatePicker();
            itemDetails.toggleSideTables();
            itemDetails.switchFinanceTabs();
            itemDetails.switchFinancePeriod();
            itemDetails.toggleDinhGiaOptions();
            itemDetails.toggleTinHieuTable();
            itemDetails.toggleKhuyenNghiTable();
            itemDetails.toggleBackTestOptions();
        },

        toggleMenu: function() {
            $( '.code-details__close' ).on( 'click', function() {
                $( this )
                    .toggleClass( 'is-toggle' )
                    .closest( '.code-details' )
                    .toggleClass( 'is-sm' );
            } );
        },

        selectMenuItem: function() {
            var $menu = $( '.code-details__menu ul' ),
                $sections = $( '.code-details__section' );
            $menu.on( 'click', 'a', function( e ) {
                var $this = $( this );

                $menu.find( 'a' ).removeClass( 'is-active' );
                $this.addClass( 'is-active' );

                $sections.removeClass( 'is-active' );

                var href = $this.attr( 'href' );

                if ( -1 !== href.indexOf( '#' ) ) {
                    e.preventDefault();
                    $sections.filter( '[data-tab="' + href + '"]').addClass( 'is-active' );
                }

                $( '.code-details__content' ).attr( 'data-tab', href );
            } );
        },

        initGiaoDichDatePicker: function() {
            $( '.gd__history__filter .date-picker' ).datepicker( {
                dateFormat: 'dd-mm-yy'
            } );
        },

        toggleGiaoDichTabs: function() {
            $( '.gd__tabs' ).on( 'click', 'a', function( e ) {
                var $this = $( this );

                $this.siblings().removeClass( 'is-active' );
                $this.addClass( 'is-active' );

                var $tabs = $this.closest( '.code-details__section' ).find( '.gd__tab' );
                $tabs.removeClass( 'is-active' );

                var href = $this.attr( 'href' );

                if ( -1 !== href.indexOf( '#' ) ) {
                    e.preventDefault();
                    $tabs.filter( '[data-tab="' + href + '"]').addClass( 'is-active' );
                }
            } );
        },

        toggleSuKienTabs: function() {
            $( '.sukien__tabs' ).on( 'click', 'a', function( e ) {
                var $this = $( this );

                $this.siblings().removeClass( 'is-active' );
                $this.addClass( 'is-active' );

                var $tabs = $this.closest( '.code-details__section' ).find( '.sukien__tab' );
                $tabs.removeClass( 'is-active' );

                var href = $this.attr( 'href' );

                if ( -1 !== href.indexOf( '#' ) ) {
                    e.preventDefault();
                    $tabs.filter( '[data-tab="' + href + '"]').addClass( 'is-active' );
                }
            } );
        },

        toggleDinhGiaOptions: function() {
            $( '.dg__options .js-my-select' ).on( 'change', function( e ) {
                var $this = $( this );

                $this.siblings().removeClass( 'is-active' );
                $this.addClass( 'is-active' );

                var $tabs = $this.closest( '.code-details__section' ).find( '.dg__option ' );
                $tabs.removeClass( 'is-active' );
                var val = $this.val();

                $tabs.filter( '[data-tab="' + val + '"]').addClass( 'is-active' );

            } );
        },

        toggleTinHieuTable: function() {
            var $table_date = $( '.is-active > .table-date' ).html();
            var $header_date = $( '.header-date' ).html( $table_date );

            var $table_tenma_full = $( '.is-active > .table-tenma-full' ).html();
            var $header_tenma_full = $( '.header-tenma-full' ).html( $table_tenma_full );

            var $table_lth = $( '.is-active > .table-loai-th' ).html();
            var $header_lth = $( '.header-loai-th' ).html( $table_lth );
        },

        toggleKhuyenNghiTable: function() {
            var $table_date = $( '.is-active > .table-date-kn' ).html();
            var $header_date = $( '.header-date-kn' ).html( $table_date );

            var $table_tenma_full = $( '.is-active > .table-noi-dung' ).html();
            var $header_tenma_full = $( '.header-noi-dung' ).html( $table_tenma_full );

            var $table_link = $( '.is-active > .table-link' ).html();
            var $header_link = $( '.header-link' ).html( $table_link );
        },

        toggleBackTestOptions: function() {
            $( '.backtest-options .js-my-select' ).on( 'change', function( e ) {
                var $this = $( this );

                $this.siblings().removeClass( 'is-active' );
                $this.addClass( 'is-active' );

                var $tabs = $this.closest( '.sub-navigation__item' ).find( '.bk__option ' );
                $tabs.removeClass( 'is-active' );
                var val = $this.val();

                $tabs.filter( '[data-tab="' + val + '"]').addClass( 'is-active' );

            } );
        },

        toggleSideTables: function() {
            $( '.code-details__tables__nav' ).on( 'click', 'a', function( e ) {
                e.preventDefault();

                var $this = $( this );
                $this.siblings().removeClass( 'is-active' );
                $this.addClass( 'is-active' );

                var $tabs = $this.parent().siblings();
                $tabs.removeClass( 'is-active' );
                $tabs.filter( '[data-tab="' + $this.attr( 'href' ) + '"]').addClass( 'is-active' );
            } );
        },

        switchFinanceTabs: function() {
            var $sections = $( '.tc__section' );
            $( '.tc__dropdown' ).on( 'click', 'a', function( e ) {
                e.preventDefault();

                var $this = $( this );

                $( '.tc__dropdown__text' ).text( $this.text() );

                var href = $this.attr( 'href' ),
                    $section = $sections.filter( '[data-tab="' + href + '"]' ),
                    headerOffset = 90;

                if ( window.innerWidth < 1280 ) {
                    headerOffset = 60;
                }

                $( [document.documentElement, document.body] ).animate( {
                    scrollTop: $section.offset().top - Math.floor( $fixedComponents.outerHeight() ) - headerOffset
                }, 500 );
            } );
        },

        switchFinancePeriod: function() {
            $( '.tc__period' ).on( 'click', 'a', function( e ) {
                e.preventDefault();

                var $this = $( this );

                $this.siblings().removeClass( 'is-active' );
                $this.addClass( 'is-active' );

                var href = $this.attr( 'href' ),
                    others = '#quarter' === href ? '#year' : '#quarter';
                $( '[data-tab="' + others + '"]' ).removeClass( 'is-active' );
                $( '[data-tab="' + href + '"]' ).addClass( 'is-active' );
            } );
        }
    };

    var market = {
        $sections: $( '.market__section' ),
        $descriptions: $( '.market__description__item' ),
        init: function() {
            market.toggleIndex();
            market.toggleFilter();
            market.toggleSubMenu();
        },

        toggleSubMenu: function() {
            var $subMenu = $( '.sub-navigation__item' );
            $( '.market__main-navigation' ).on( 'click', '.nav-tab', function( e ) {
                e.preventDefault();
                var $this = $( this );
                var href = $this.attr( 'href' );

                if ( href === '#tin-hieu' ) {
                    market.$sections.removeClass( 'is-active' );
                    market.$descriptions.removeClass( 'is-active' );
                }

                $subMenu.removeClass( 'is-active' );
                var $activeSubMenu = $subMenu.filter( '[data-tab="' + href + '"]' ).addClass( 'is-active' );
                $activeSubMenu.find( 'li:first-child a' ).addClass( 'active' ).trigger( 'click' );
            } );
        },

        toggleIndex: function() {
            $( '.market__sub-navigation' ).on( 'click', '.market__sub__link', function( e ) {
                e.preventDefault();

                var $this = $( this );

                $( '.index__select__text' ).text( $this.text() );

                var href = $this.attr( 'href' );

                market.$sections.removeClass( 'is-active' );
                market.$descriptions.removeClass( 'is-active' );

                market.$sections.filter( '[data-tab="' + href + '"]' ).addClass( 'is-active' );
                market.$descriptions.filter( '[data-tab="' + href + '"]' ).addClass( 'is-active' );
            } );
        },
        toggleFilter: function() {
            $( '.market__filter' ).on( 'click', 'a', function( e ) {
                e.preventDefault();

                var $this = $( this );

                $this.closest( '.market__select' ).find( '.market__select__text' ).text( $this.text() );
            } );
        }
    }

    var accountManagement = {
        init: function() {
            accountManagement.toggleFilter();
            accountManagement.toggleTypes();
        },
        toggleFilter: function() {
            $( '.qltk__select' ).on( 'click', 'a', function( e ) {
                e.preventDefault();

                var $this = $( this );

                $this.closest( '.qltk__select' ).find( '.qltk__select__text' ).text( $this.text() );
            } );
        },
        toggleTypes: function() {
            var $sections = $( '.qltk__section' );
            $( '.qltk__types' ).on( 'click', 'a', function( e ) {
                e.preventDefault();

                var $this = $( this );
                $this.siblings().removeClass( 'is-active' );
                $this.addClass( 'is-active' );

                var href = $this.attr( 'href' );
                $sections.removeClass( 'is-active' );
                $sections.filter('[data-tab="' + href + '"]').addClass( 'is-active' );
            } );
        },
    }

    function sortTables( table ) {
        var $body = $( table ).find( '.table__body' );
        $body.tablesorter();
        $( table ).on( 'click', '.sortable', function() {
            var index = parseInt( $( this ).attr( 'data-index' ) );
            $body.trigger( 'sorton', [ [ [index, "n"] ] ] );
        } );
    }
    [ '#bang-gia', '#co-ban', '#khuyen-nghi' ].forEach( function( table ) {
        sortTables( table );
    } )

    var danhMucMoi = {
        $wrapper: $( '.danh-muc-moi-wrapper' ),
        init: function() {
            danhMucMoi.addAvailableDanhMuc();
            danhMucMoi.hideOnClickOutside();
            $body.on( 'click', '.init-danh-muc-moi', function() {
                danhMucMoi.$wrapper.removeClass( 'is-hidden' );
            } );
            $body.on( 'click', '.add-danh-muc', function() {
                danhMucMoi.$wrapper.addClass( 'is-hidden' );
            } );
        },
        addAvailableDanhMuc: function() {
            var $list = $( '.danh-muc__da-co' ).empty();
            var $availableDanhMuc = $( '.dropdown-menu--danh-muc' ).find( '.list__item' );
            var items = [];
            $availableDanhMuc.each( function() {
                var name = $( this ).text();
                items.push( '\
					<div class="danh-muc__item">'
                    + name + '\
						<span class="add-danh-muc"><i class="fas fa-plus"></i></span>\
					</div>\
				' );
            } );
            $list.append( items );
        },
        hideOnClickOutside: function() {
            $( document ).on( 'click', function( e ) {
                if ( ! danhMucMoi.$wrapper.is( e.target ) && ! $( '.init-danh-muc-moi' ).is( e.target ) && danhMucMoi.$wrapper.has( e.target ).length === 0 ) {
                    danhMucMoi.$wrapper.addClass( 'is-hidden' );
                }
            } )
        }
    }

    var datLenhPopup = {
        loaiGia            : ['ATC', 'ATO', 'MP', 'MOK', 'MAK', 'MTL', 'PLO'],
        lenhDatas          : [],
        $wrapper           : null,
        $muaBanSelect      : null,
        $datLenhBanDropdown: null,
        $submitButton      : null,
        $inputCode         : null,
        $infoKiQuy         : null,
        //$infoCode          : null,
        //$codeWrapper       : null,
        $tkInfo            : null,
        $codeName          : null,
        $codeCompany       : null,
        $inputGia          : null,
        $inputKL           : null,
        $selectTK          : null,
        init: function() {
            datLenhPopup.togglePopup();
            datLenhPopup.handleMuaBanSelect();
            datLenhPopup.handleSelectTK();
            datLenhPopup.handleSelectMaCK();
            datLenhPopup.handleEnterGia();
            datLenhPopup.submit();
            datLenhPopup.toggleAllCheckBox();
            datLenhPopup.handleFooterPopupSelect();
            datLenhPopup.handleLenhSelect();
            datLenhPopup.editLenh();
            datLenhPopup.copyLenh();
            datLenhPopup.huyDatLenh();
            datLenhPopup.huySoLenh();
            datLenhPopup.addClassToSoLenhTableRow();
            datLenhPopup.handleDanhMucMuaBan();
            datLenhPopup.setSavedInput();
        },
        initElements: function() {
            datLenhPopup.$wrapper            = $( '.dat-lenh-popup' );
            datLenhPopup.$muaBanSelect       = $( '.form__select-mua-ban' );
            datLenhPopup.$datLenhBanDropdown = $( '.dat-lenh__ban' );
            datLenhPopup.$submitButton       = $( '.dat-lenh-popup__btn--submit' );
            datLenhPopup.$inputCode          = $( '.form__input--code input[type="text"]' );
            datLenhPopup.$infoKiQuy          = $( '.info--ki-quy' );
            datLenhPopup.$inputGia           = $( '.form__input--gia input[type="text"]' );
            datLenhPopup.$inputKL            = $( '.form__input--KL input[type="text"]' );
            datLenhPopup.$selectTK           = $( '.form__select-tai-khoan');
            datLenhPopup.$soLenhPopup        = $( '.so-lenh-popup');
            datLenhPopup.$danhMucPopup       = $( '.danh-muc-popup');
            //datLenhPopup.$infoCode           = $( '.dat-lenh__info--code' );
            datLenhPopup.$tkInfo             = $( '.dat-lenh-popup__tk-info' );
            //datLenhPopup.$codeWrapper        = $( '.dat-lenh-popup__code' );
            //datLenhPopup.$codeName           = $( '.dat-lenh-popup__code__name' );
            //datLenhPopup.$codeCompany        = $( '.dat-lenh-popup__code__company' );

        },
        togglePopup: function() {
            $( '.init-dat-lenh-popup, .form__close' ).on( 'click', function( e ) {
                e.preventDefault();
                $body.toggleClass( 'enable-dat-lenh-popup' );
            } );
            datLenhPopup.initElements();
        },

        // Kiểm tra xem input nào có checkbox được check
        // thì thêm class is-saved để khi đặt lệnh vẫn lưu giá trị
        setSavedInput: function() {
            datLenhPopup.$wrapper.on( 'change', '.form__body input[type="checkbox"]', function() {
                var $this  = $( this );
                var $input = $this.closest( 'label' ).prev( 'input[type="text"]' );
                $input.toggleClass( 'is-saved', $this.prop( 'checked' ) );
            } );
        },
        // Set dữ liệu dropdown.
        setDropdownData: function( $dropdown, value ) {
            $dropdown.find( '.dropdown-toggle span' ).text( value );
        },
        // Lấy dữ liệu dropdown.
        getDropdownData: function( $dropdown ) {
            return $dropdown.find( '.dropdown-toggle span' ).text();
        },
        handleSelectTK: function() {
            $( '.form__select-tai-khoan' ).on( 'click', '.dropdown-menu--tai-khoan a', function( e ) {
                e.preventDefault();
                var $this  = $( this );
                var dataTK = $this.attr( 'data-tk' );

                // Ẩn hiện box thông tin tk ở bên trái.
                datLenhPopup.$tkInfo.toggleClass( 'is-visible', dataTK ? true : false );

                // Thay đổi giá trị của select khi lựa chọn tk.
                $this.closest( '.form__select-tai-khoan' ).find( '.dropdown-toggle span' ).text( $this.text() );

                // Ẩn hiện sức mua tài khoản.
                $( '.info--tk' ).toggleClass( 'is-hidden', dataTK ? false : true );
            } )
        },
        handleSelectMaCK: function() {
            datLenhPopup.selectCode();
            datLenhPopup.manualSelectCode();
        },
        handleEnterGia: function() {
            var $table    = $( '.visible-on-price' );
            datLenhPopup.$inputGia.autocomplete( {
                source: datLenhPopup.loaiGia
            } ).on( 'change', function( e ) {
                var value = $( this ).val();
                $table.toggleClass( 'is-hidden', value ? false : true );
            } );
        },
        handleMuaBanSelect: function() {
            $( '.form__select-mua-ban' ).on( 'click', '.dropdown-menu a', function( e ) {
                e.preventDefault();
                var value         = $( this ).text();
                var isSelling     = null;
                var $dropDownMenu = $( this ).closest( '.dropdown-menu' );
                isSelling         = $dropDownMenu.hasClass( 'dropdown-menu--ban' ) ? true : false;
                if ( isSelling ) {
                    datLenhPopup.$wrapper.removeClass().addClass( 'is-selling dat-lenh-popup' );
                } else {
                    datLenhPopup.$wrapper.removeClass().addClass( 'is-buying dat-lenh-popup' );
                }
                datLenhPopup.toggleMuaBanSelectText( value, isSelling );
                datLenhPopup.toggleSubmitButton( value, isSelling );
            } )
        },
        toggleSubmitButton: function( value, isSelling ) {
            datLenhPopup.$submitButton.text( value );
            datLenhPopup.$submitButton.toggleClass( 'btn--red-2', isSelling );
        },
        toggleMuaBanSelectText: function( value, isSelling ) {
            // datLenhPopup.$muaBanSelect.closest( '.dat-lenh-popup__actions' ).toggleClass( 'is-selling', isSelling );
            // datLenhPopup.$muaBanSelect.toggleClass( 'is-selling', isSelling );
            var $mua = $( '.dat-lenh__mua .dropdown-toggle span' );
            var $ban = $( '.dat-lenh__ban .dropdown-toggle span' );
            if ( isSelling ) {
                $ban.text( value );
                $mua.text( 'Mua' );
            } else {
                $mua.text( value );
                $ban.text( 'Bán' );
            }
        },
        selectCode: function() {
            datLenhPopup.$inputCode.autocomplete( {
                source: addCode.codes,
                select: function( event, ui ) {
                    event.preventDefault();
                    //datLenhPopup.insertDataFromCode( ui.item )
                    //datLenhPopup.$infoCode.removeClass( 'is-hidden' );
                    $( this ).val( ui.item.value.toUpperCase() );
                    datLenhPopup.$infoKiQuy.removeClass( 'is-hidden' );
                }
            } ).on( 'input', function( e ) {
                var value = e.target.value;
                if ( value === '' ) {
                    //datLenhPopup.$infoCode.addClass( 'is-hidden' );
                    //datLenhPopup.$codeWrapper.removeClass( 'is-visible' );

                    // Nếu rỗng thì ẩn kí quỹ đi.
                    datLenhPopup.$infoKiQuy.addClass( 'is-hidden' );
                    return;
                }
                $( this ).val( value.toUpperCase() );
            } );
        },
        // Khi nhấn Enter hoặc nhấn tab.
        manualSelectCode: function() {
            datLenhPopup.$inputCode.on( 'keydown', function( e ) {
                if ( e.which != 13 && e.which != 9 ) {
                    return;
                }
                var $this = $( this );
                var code = $this.val().toLowerCase();

                var filtered = addCode.codes.filter( function( item ) {
                    return item.value.toLowerCase().indexOf( code ) === 0;
                } );

                /*	if ( filtered.length ) {
                        datLenhPopup.insertDataFromCode( filtered[0] );
                    }*/

                $this.val( code.toUpperCase() );
                $this.autocomplete( 'close' );
                datLenhPopup.$infoKiQuy.removeClass( 'is-hidden' );
            } );
        },
        getLenhData: function() {
            var data = {
                state: datLenhPopup.$wrapper.hasClass( 'is-selling' ) ? 'selling' : 'buying',
                tk   : datLenhPopup.getDropdownData( datLenhPopup.$selectTK ),
                lenh : datLenhPopup.$wrapper.hasClass( 'is-selling' ) ? 'Bán' : 'Mua',
                code : datLenhPopup.$inputCode.val(),
                kl   : $( '.form__input--KL input' ).val(),
                gia  : $( '.form__input--gia input' ).val(),
            }
            return data;
        },
        insertDataToSoLenh: function( data ) {
            if ( ! data.kl || ! data.code || ! data.gia ) {
                return;
            }
            datLenhPopup.setDropdownData( $( '.so-lenh__tk' ), data.tk );
            // Thêm span bao lấy phần code rồi cho float right để khi dài ra chữ sẽ chạy sang phải.
            var tr = '\
				<tr>\
					<td><input class="so-lenh__table__checkbox" type="checkbox" name="" value=""></td>\
					<td>' + data.lenh + '</td>\
					<td class="so-lenh__table__code span"><span>' + data.code + '<span></td>\
					<td class="txt-right so-lenh__table__KL">' + data.kl + '</td>\
					<td class="txt-right">90.000</td>\
					<td class="txt-right so-lenh__table__gia">' + data.gia + '</td>\
					<td>KMP</td>\
					<td class="so-lenh__table__edit"><i class="fas fa-pencil-alt"></i></td>\
					<td class="so-lenh__table__copy" data-state="' + data.state + '"><i class="far fa-copy"></i></td>\
				</tr>\
			';
            $( '.so-lenh__table tbody' ).append( tr );
        },
        submit: function() {
            datLenhPopup.$submitButton.on( 'click', function() {
                datLenhPopup.addDatLenhNotice();
                datLenhPopup.resetDatLenh();
            } );
        },
        activeFooterNavigation: function() {
            // Check nếu sổ lệnh popup đã hiện ( không có class is hidden )
            // thì không click nữa.
            if ( ! datLenhPopup.$soLenhPopup.hasClass( 'is-hidden' ) ) {
                return;
            }
            // Làm click để tránh trường hợp các bảng danh mục hoặc tài sản đang bật thì sẽ bị ẩn đi
            $( '.footer-navigation__link[href="#so-lenh-popup"]' ).trigger( 'click' );
        },
        addDatLenhNotice: function() {
            var random         = Math.floor( Math.random() * 2 );
            var $datLenhNotice = $( '.dat-lenh-notice' );
            var text           = '';
            if ( random ) {
                // Nếu đặt thành công
                $datLenhNotice.removeClass( 'failure' ).addClass( 'success' );
                text = 'Đặt lệnh thành công';
                var data = datLenhPopup.getLenhData();
                datLenhPopup.insertDataToSoLenh( data );
                datLenhPopup.activeFooterNavigation();
                //datLenhPopup.toggleSoLenh();
            } else {
                $datLenhNotice.removeClass( 'success' ).addClass( 'failure' );
                text = 'Tài khoản không đủ số dư. Mã lỗi: ABCXYZ';
            }
            $datLenhNotice.text( text );
        },
        toggleAllCheckBox: function() {
            var $tableBody = $( '.so-lenh__table tbody' );
            $( '.dropdown__checkall' ).on( 'change', function() {
                $tableBody.find( 'input[type="checkbox"]' ).prop( 'checked', $( this ).prop( 'checked' ) );
            } );
        },
        handleFooterPopupSelect: function() {
            $( '.footer-nav-popup__select' ).on( 'click', '.dropdown-menu a', function( e ) {
                e.preventDefault();
                var $this  = $( this );
                var $dropdown = $this.closest( '.footer-nav-popup__select' );
                datLenhPopup.setDropdownData( $dropdown, $this.text() );
            } )
        },
        handleLenhSelect: function() {
            $( '.so-lenh__lenh' ).on( 'click', '.dropdown-menu a', function( e ) {
                e.preventDefault();
                var $this  = $( this );
                var value = $this.attr( 'data-value' );
                datLenhPopup.$soLenhPopup.removeClass().addClass( 'footer-nav-popup so-lenh-popup ' + value );
            } )
        },
        addClassToSoLenhTableRow: function() {
            datLenhPopup.$soLenhPopup.on( 'click', '.so-lenh__table__checkbox', function() {
                var $row = $( this ).closest( 'tr' );
                $row.toggleClass( 'is-checked' );
            } )
        },
        huySoLenh: function() {
            var $huyBtn = $( '.so-lenh__huy' );
            $huyBtn.on( 'click', function() {
                datLenhPopup.$soLenhPopup.find( 'input[type="checkbox"]' ).prop( 'checked', false );
                datLenhPopup.$soLenhPopup.find( 'tr.is-checked' ).remove();
            } )
        },
        copyLenh: function() {
            datLenhPopup.$soLenhPopup.on( 'click', '.so-lenh__table__copy', function() {
                var $this     = $( this );
                var $row      = $this.closest( 'tr' );
                var state     = $this.attr( 'data-state' );
                var value     = state === 'selling' ? 'Bán' : 'Mua';
                var isSelling = state === 'selling' ? true : false;
                datLenhPopup.$wrapper.removeClass().addClass( 'is-' + state + ' dat-lenh-popup' );
                datLenhPopup.setDataFromLenh( $row );

                // Khi copy thì phải thay đổi cả select mua bán và nút submit.
                datLenhPopup.toggleMuaBanSelectText( value, isSelling );
                datLenhPopup.toggleSubmitButton( value, isSelling );

                $body.addClass( 'enable-dat-lenh-popup' );
            } );
        },
        editLenh: function() {
            datLenhPopup.$soLenhPopup.on( 'click', '.so-lenh__table__edit', function() {
                datLenhPopup.$wrapper.removeClass().addClass( 'is-editing dat-lenh-popup' );
                var $this = $( this );
                var $row  = $this.closest( 'tr' );

                var $soLenhGia = $row.find( '.so-lenh__table__gia' );
                var $soLenhKL = $row.find( '.so-lenh__table__KL' );

                datLenhPopup.$inputGia.on( 'change', function() {
                    $soLenhGia.text( $( this ).val() );
                } )
                datLenhPopup.$inputKL.on( 'change', function() {
                    $soLenhKL.text( $( this ).val() );
                } )

                datLenhPopup.setDataFromLenh( $row );

                // Disable giá và tài khoản
                datLenhPopup.$selectTK.addClass( 'is-disabled' );
                datLenhPopup.$inputCode.addClass( 'is-disabled' );

                $body.addClass( 'enable-dat-lenh-popup' );
            } )
        },
        // Khi nhấn edit hoặc copy lệnh trong sổ lệnh
        // Lấy data từ lệnh đã đặt và đưa vào ô input trong phần đặt lệnh
        setDataFromLenh: function( $row ) {
            var $soLenhCode = $row.find( '.so-lenh__table__code span' );
            var $soLenhGia = $row.find( '.so-lenh__table__gia' );
            var $soLenhKL = $row.find( '.so-lenh__table__KL' );

            var code  = $soLenhCode.text();
            var gia   = $soLenhGia.text();
            var kl    = $soLenhKL.text();

            // Điền giá trị của lệnh vào input trong ô đặt lệnh
            datLenhPopup.$inputCode.val( code );
            datLenhPopup.$inputGia.val( gia ).focus();
            datLenhPopup.$inputKL.val( kl );
        },
        huyDatLenh: function() {
            $( '.gio-lenh__huy' ).on( 'click', function() {
                datLenhPopup.resetDatLenh();
            } );
        },
        resetDatLenh: function() {
            datLenhPopup.$wrapper.find( 'input' ).not( '.is-saved' ).val( '' );
            if ( ! datLenhPopup.$inputCode.hasClass( 'is-saved' ) ) {
                datLenhPopup.$infoKiQuy.addClass( 'is-hidden' );
            }
            if ( ! datLenhPopup.$inputGia.hasClass( 'is-saved' ) ) {
                $( '.visible-on-price' ).addClass( 'is-hidden' );
            }
            $( '.info--tk' ).addClass( 'is-hidden' );
            datLenhPopup.setDropdownData( $( '.form__select-tai-khoan' ), 'Tài khoản' );
        },
        toggleSoLenh: function() {
            if ( ! datLenhPopup.$soLenhPopup.hasClass( 'is-hidden' ) ) {
                return;
            }
            datLenhPopup.$soLenhPopup.removeClass( 'is-hidden' );
        },
        handleDanhMucMuaBan: function() {
            datLenhPopup.$danhMucPopup.on( 'click', '.danh-muc__table__action', function( e ) {
                e.preventDefault();
                var $this  = $( this );
                var action = $this.attr( 'data-action' );
                var $row   = $this.closest( 'tr' );
                var code   = $row.find( '.danh-muc__table__code' ).text();
                var tk     = datLenhPopup.$danhMucPopup.find( '.dropdown-toggle span' ).text();

                var value     = action === 'selling' ? 'Bán' : 'Mua';
                var isSelling = action === 'selling' ? true : false;

                datLenhPopup.$inputCode.val( code );
                datLenhPopup.$selectTK.find( '.dropdown-toggle span' ).text( tk );

                $body.addClass( 'enable-dat-lenh-popup' );
                datLenhPopup.$wrapper.removeClass().addClass( 'dat-lenh-popup is-' + action );

                // Khi copy thì phải thay đổi cả select mua bán và nút submit.
                datLenhPopup.toggleMuaBanSelectText( value, isSelling );
                datLenhPopup.toggleSubmitButton( value, isSelling );
            } );
        }
    }
    function toggleFooterNavPopup() {
        $( '.footer-navigation__link' ).on( 'click', function( e ) {
            e.preventDefault();
            var $this = $( this );

            $this.siblings().removeClass( 'is-active' );
            $this.toggleClass( 'is-active' );

            $( '.footer-nav-popup' ).addClass( 'is-hidden' );

            $( '.footer-nav-popup' ).filter( $this.attr( 'href' ) ).toggleClass( 'is-hidden', ! $this.hasClass( 'is-active' ) );

        } )
    }

    function setMaxHeightFooterNavPopup() {
        $( '.footer-nav-popup' ).css( 'height', window.innerHeight - Math.floor( $fixedComponents.outerHeight() ) - 75 );
    }

    function closeFooterNavPopup() {
        var $close = $( '.footer-nav-popup__close' );
        var $popup = $close.closest( '.footer-nav-popup' );
        $close.on( 'click', function() {
            $popup.addClass( 'is-hidden' );
            $( '.footer-navigation__link' ).removeClass( 'is-active' );
        } )
    }

    function closeFooterNavFooterPopup() {
        var $close = $( '.footer-nav-popup__footer-close' );
        var $footer = $close.closest( '.footer-nav-popup__footer' );
        $close.on( 'click', function() {
            $footer.toggleClass( 'is-minimized' );
        } )
    }

    // Không làm kiểu object init cho 2 element được vì sẽ bị trùng object.
    var DsLenh = function( element ) {
        this.$el             = element;
        this.totalRow        = null;
        this.hiddenFromPos   = 5;
        this.hiddenBeforePos = 1;
        this.rowNumber       = 5;
        this.pageNumber      = 1;
    };
    DsLenh.prototype.init = function() {
        this.$checkAll        = this.$el.find( '.dsl__dropdown__checkall' );
        this.$checkBoxes      = this.$el.find( '.dsl__dropdown__checkbox' );
        this.$tableBody       = this.$el.find( 'tbody' );
        this.$tableRow        = this.$tableBody.find( 'tr' );
        this.$dropdownFooter  = this.$el.next( '.dsl__dropdown__footer' );
        this.$pageNumberInput = this.$dropdownFooter.find( '.dropdown-pagination__page-number' );
        this.$rowNumberInput  = this.$dropdownFooter.find( '.dropdown-pagination__row-number' );

        this.initPagination();
        this.hideRow();
        this.goNext();
        this.goPrev();
        this.goFirst();
        this.goLast();
        this.handlePageNumberInput();
        this.handleRowNumberInput();
        this.toggleDropdownTableCheckbox();
    };
    DsLenh.prototype.initPagination = function() {
        this.totalRow = this.$tableBody.find( 'tr' ).length;
        this.setTotalPageNumber();
    };
    DsLenh.prototype.hideRow = function() {
        this.$tableRow.removeClass( 'is-hidden' )
            .lt( this.hiddenBeforePos - 1 ).addClass( 'is-hidden' );
        this.$tableRow.removeClass( 'hidden-from-now' )
            .eq( this.hiddenFromPos - 1  ).addClass( 'hidden-from-now' );
    };
    DsLenh.prototype.setTotalPageNumber = function() {
        this.totalPageNumber = Math.ceil( this.totalRow / this.rowNumber ) ;
        this.$pageNumberInput.attr( 'max', this.totalPageNumber );
    }
    DsLenh.prototype.goNext = function() {
        var that = this;
        this.$dropdownFooter.on( 'click', '.next', function() {
            if ( that.hiddenBeforePos + that.rowNumber > that.totalRow ) {
                return;
            }
            that.hiddenBeforePos += that.rowNumber;
            that.hiddenFromPos = that.hiddenBeforePos + that.rowNumber - 1;
            if ( that.hiddenFromPos > that.totalRow ) {
                that.hiddenFromPos = that.totalRow;
                that.hiddenBeforePos = that.totalRow - that.totalRow % that.rowNumber + 1;
            }
            that.handeNextPrev( 'next' );
            that.hideRow();
        } )
    };
    DsLenh.prototype.goPrev = function() {
        var that = this;
        this.$dropdownFooter.on( 'click', '.prev', function() {
            that.hiddenBeforePos -= that.rowNumber;
            that.hiddenFromPos = that.hiddenBeforePos + that.rowNumber - 1;
            if ( that.hiddenFromPos < that.rowNumber ) {
                that.hiddenFromPos = that.rowNumber;
                that.hiddenBeforePos = 1;
            }
            that.handeNextPrev( 'prev' );
            that.hideRow();
        } )
    };
    DsLenh.prototype.handeNextPrev = function() {
        var direction = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
        if ( 'next' === direction ) {
            this.pageNumber++;
        } else if ( 'prev' === direction ) {
            this.pageNumber--;
        }
        this.limitPageNumber();
        this.$pageNumberInput.val( this.pageNumber );
    };
    DsLenh.prototype.limitPageNumber = function() {
        if ( this.pageNumber > this.totalPageNumber ) {
            this.pageNumber = this.totalPageNumber;
            this.$pageNumberInput.val( this.totalPageNumber );
        } else if ( this.pageNumber < 1 ) {
            this.pageNumber = 1;
            this.$pageNumberInput.val( 1 );
        }
    }
    DsLenh.prototype.goFirst = function() {
        var that = this;
        this.$dropdownFooter.on( 'click', '.first', function() {
            that.hiddenFromPos   = that.rowNumber;
            that.hiddenBeforePos = 1;
            that.pageNumber      = 1;

            that.$pageNumberInput.val( that.pageNumber );
            that.hideRow();
        } )
    };
    DsLenh.prototype.goLast = function() {
        var that = this;
        this.$dropdownFooter.on( 'click', '.last', function() {
            that.hiddenFromPos   = that.totalRow;
            if ( that.totalRow % that.rowNumber !== 0 ) {
                that.hiddenBeforePos = that.totalRow - that.totalRow % that.rowNumber + 1;
            } else {
                that.hiddenBeforePos = that.totalRow - that.rowNumber + 1;
            }
            that.pageNumber      = that.totalPageNumber;

            that.$pageNumberInput.val( that.pageNumber );
            that.hideRow();
        } )
    };
    DsLenh.prototype.handlePageNumberInput = function() {
        var that = this;
        this.$pageNumberInput.on( 'input', function( e ) {
            that.pageNumber = parseInt( e.target.value );
            that.limitPageNumber();
            that.hiddenFromPos = that.rowNumber * that.pageNumber;
            if ( that.hiddenFromPos > that.totalRow ) {
                that.hiddenFromPos = that.totalRow;
            }
            that.hiddenBeforePos = that.hiddenFromPos - that.rowNumber + 1;
            if ( ! that.pageNumber || that.rowNumber > that.totalRow ) {
                // Nếu input rỗng hoặc rowNumber > totalRow.
                that.hiddenFromPos   = that.rowNumber;
                that.hiddenBeforePos = 1;
            }
            that.hideRow();
        } )
    };
    DsLenh.prototype.handleRowNumberInput = function() {
        var that = this;
        this.$rowNumberInput.on( 'input', function( e ) {
            that.rowNumber = parseInt( e.target.value );

            // Reset page number
            that.pageNumber = 1;
            that.$pageNumberInput.val( 1 );
            that.setTotalPageNumber();
            that.hiddenFromPos = 1;

            if ( ! that.rowNumber ) {
                that.hiddenFromPos   = 5;
                that.hiddenBeforePos = 1;
            } else {
                that.hiddenFromPos = that.rowNumber;
            }

            if ( that.hiddenFromPos > that.totalRow ) {
                that.hiddenFromPos = that.totalRow;
            }

            that.hideRow();
        } )
    };
    DsLenh.prototype.toggleDropdownTableCheckbox = function() {
        var that = this;
        $( '.dsl__dropdown__reset-checkbox' ).on( 'click', function( e ) {
            e.preventDefault();
            that.$checkAll.prop( 'checked', false );
            that.$checkBoxes.prop( 'checked', false );
        } )
        this.$checkAll.on( 'change', function( e ) {
            that.$checkBoxes.prop( 'checked', $( this ).prop('checked') );
        } )
    }
    $.fn.lt = function(n) {return this.slice(0,n);};

    var toggleDropdownTable = function() {
        $body.on( 'click', '.dsl__dropdown__toggle', function( e ) {
            e.preventDefault();
            $( this ).toggleClass( 'is-visible-dropdown' );
        } )
    }
    toggleDropdownTable();

    var tuongTacSoSanh = {
        codes: null,
        $input: null,
        inserted: [ 'KDF','KDC','KDG' ],
        init: function() {
            tuongTacSoSanh.$input = $( '#so-sanh-view-code' );
            tuongTacSoSanh.codes = addCode.codes;
            tuongTacSoSanh.add();
            tuongTacSoSanh.manualAdd();
            tuongTacSoSanh.clickAdd();
            tuongTacSoSanh.showColumn( addCode.codes );
        },
        add: function() {
            tuongTacSoSanh.$input.autocomplete({
                source: addCode.codes,
                select: function( event, ui ) {
                    tuongTacSoSanh.insertColumn(ui.item);
                }
            })
        },
        manualAdd: function() {
            tuongTacSoSanh.$input.on( 'keypress', function( e ) {
                if ( e.which != 13 ) {
                    return;
                }

                e.preventDefault();

                var code = tuongTacSoSanh.$input.val().toLowerCase();

                var filtered = tuongTacSoSanh.codes.filter( function( item ) {
                    return item.value.toLowerCase().indexOf( code ) === 0;
                } );

                if ( filtered.length ) {
                    tuongTacSoSanh.insertColumn( filtered[0] );
                }

                tuongTacSoSanh.$input.val( '' );
                tuongTacSoSanh.$input.autocomplete( 'close' );
            } );
        },
        clickAdd: function() {
            $( '#submit-view-code' ).on( 'click', function( e ) {
                e.preventDefault();

                var code = tuongTacSoSanh.$input.val().toLowerCase();

                var filtered = tuongTacSoSanh.codes.filter( function( item ) {
                    return item.value.toLowerCase() === code;
                } );

                if ( filtered.length ) {
                    tuongTacSoSanh.insertColumn( filtered[0] );
                }

                tuongTacSoSanh.$input.val( '' );
                tuongTacSoSanh.$input.autocomplete( 'close' );
            } );
        },


        showColumn: function( codes ){

            for( var i = 3; i < codes.length ; i++){

                var data = codes[i].data;

                if ( i > 5 ) {
                    break;
                }

                $('#bang-so-sanh').find('.h-table').append(
                    '<tr class="ten-ma-nganh">\
                        <td class="goi-y" colspan="2">' + data['ma'] + '-' + data['nganh'] +
                    '<button class="btn-plush" id="' + data['ma'] + '">+</button>\
						</td>\
					</tr>'
                );

            }


            for( var i = 0; i < codes.length ; i++){

                if ( i > 2 ) {
                    break;
                }

                var data = codes[i].data;
                var firstHeading = '<th rowspan="4" class="ten-ma-nganh">';
                if ( i > 0 ) {
                    firstHeading += '<button id="' + data['ma'] + '" class="xoa">x</button>';
                }
                firstHeading +=  data['ma'] + '</br>' + data['nganh'] + '</th>';

                $('#bang-so-sanh').find('.th').append( firstHeading );


                $('#bang-so-sanh').find('.h-table-so-sanh td').each(function() {
                    $(this).attr('colspan', Number($(this).attr('colspan')) + 1);
                });

                $('#bang-so-sanh tbody').find('tr').each(function(){

                    var key = $(this).find('td').eq(0).attr('data-key');
                    var tdValue =  data[key] ? data[key] : '';
                    var td = '<td class="rm-' +  data['ma'] + ' txt-right txt-green">' + tdValue + '</td>';

                    $(this).find('td').eq(1).after(td);

                });



            }
        },

        insertColumn: function(item) {

            var data = item.data;
            if ( tuongTacSoSanh.inserted.indexOf( data['ma'] ) !== -1 ) {
                alert("Mã đã tồn tại");
                return;
            }

            if ( tuongTacSoSanh.inserted.length === 5 ) {
                alert("chỉ so sánh được tối đa là 5 mã");
                return;
            }
            tuongTacSoSanh.inserted.push( data['ma'] );

            $('#bang-so-sanh').find('.th').append(
                '<th rowspan="4" class="ten-ma-nganh">\
                    <button id="' + data['ma'] + '" class="xoa">x</button>' +
                data['ma'] + '</br>' + data['ten'] +
                '</th>'
            );

            $('#bang-so-sanh').find('.h-table-so-sanh td').each(function() {
                $(this).attr('colspan', Number($(this).attr('colspan')) + 1);
            });

            $('#bang-so-sanh tbody').find('tr').each(function(){

                var key = $(this).find('td').eq(0).attr('data-key');
                var tdValue =  data[key] ? data[key] : '';
                var td = '<td class="rm-' +  data['ma'] + ' txt-right txt-green">' + tdValue + '</td>';

                $(this).find('td').eq(1).after(td);
            });
        },
        removeColumn: function(item) {
            var th = item.closest('th');
            var code = item.attr( 'id' );
            tuongTacSoSanh.inserted = tuongTacSoSanh.inserted.filter( function ( elem ) {
                return elem !== code
            } );
            item.closest('th').remove();

            $('#bang-so-sanh').find('.h-table-so-sanh td').each(function() {
                $(this).attr('colspan', Number($(this).attr('colspan')) - 1);
            });

            $('#bang-so-sanh tbody').find('tr').each(function(){
                $(this).find('td.rm-' + item.attr('id') ).remove();
            });
        }
    }
    toggleTables();
    toggleTab();
    toggleClassActive();
    initModals();
    hideModals();
    toggleTableData();
    editListItem();
    deleteListItem();
    createListItem();
    initChartSlider();
    removeCode();

    danhMucMoi.init();
    addCode.init();
    viewCode.init();
    datLenhPopup.init();
    tuongTacSoSanh.init();
    toggleFooterNavPopup();
    closeFooterNavPopup();
    closeFooterNavFooterPopup();
    setMaxHeightFooterNavPopup();

    $window.on( 'load', function() {
        stickyHeader();
        toggleChart();
    } );
    $window.on( 'resize', stickyHeader );
    $window.on( 'orientchange', stickyHeader );

    var bangGia = new SortCodes( '#bang-gia .table__body tbody', 'orderBangGia' );
    var coBan = new SortCodes( '#co-ban .table__body tbody', 'orderCoban' );
    bangGia.init();
    coBan.init();

    var trongNgay = new DsLenh( $( '.dsl__dropdown__table--trong-ngay' ) );
    var gioLenh = new DsLenh( $( '.dsl__dropdown__table--gio-lenh' ) );
    var danhMucTaiSan = new DsLenh( $( '.dsl__dropdown__table--dmts' ) );
    trongNgay.init();
    gioLenh.init();
    danhMucTaiSan.init();

    phaiSinh.init();
    chungQuyen.init();
    itemDetails.init();
    market.init();
    accountManagement.init();

    $('#bang-so-sanh').on('click', 'button.xoa', function() {



        tuongTacSoSanh.removeColumn($(this));
    });

    $('#bang-so-sanh').on('click', 'button.btn-plush', function() {
        var code = $( this ).attr( 'id' ).toLowerCase();
        var filtered = tuongTacSoSanh.codes.filter( function( item ) {
            return item.value.toLowerCase().indexOf( code ) === 0;
        } );
        if ( filtered.length ) {
            tuongTacSoSanh.insertColumn( filtered[0] );
        }
    });
}( jQuery ) );