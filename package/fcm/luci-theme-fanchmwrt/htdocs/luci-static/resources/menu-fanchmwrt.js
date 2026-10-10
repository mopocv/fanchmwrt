'use strict';
'require baseclass';
'require ui';

return baseclass.extend({
	menuIcons: {
		'status': 'status',
		'system': 'system',
		'network': 'fwx_network',
		'services': 'services',
		'vpn': 'vpn',
		'nas': 'nas',
		'statistics': 'fwx_monitor',
		'containers': 'containers',
		'docker': 'containers',
		'dockerman': 'containers',
		'vpnserver': 'vpn',
		'bandwidth': 'fwx_monitor',
		'logout': 'logout',
		'overview': 'fwx_dashboard',
		'interfaces': 'interfaces',
		'wireless': 'fwx_wireless',
		'routes': 'routes',
		'routing': 'routes',
		'dhcp': 'dhcp',
		'dns': 'dns',
		'network_diag': 'diagnostics',
		'diagnostics': 'diagnostics',
		'firewall': 'firewall',
		'logs': 'logs',
		'syslog': 'logs',
		'dmesg': 'logs',
		'processes': 'processes',
		'realtime': 'fwx_monitor',
		'admin': 'fwx_user',
		'software': 'fwx_app_center',
		'packages': 'fwx_app_center',
		'startup': 'processes',
		'crontab': 'dhcp',
		'mounts': 'nas',
		'flash': 'upgrade',
		'reboot': 'reboot',
		'leds': 'status',
		'backup': 'nas',
		'nikki': 'vpn',
		'openclash': 'vpn',
		'passwall': 'vpn',
		'passwall2': 'vpn',
		'package-manager': 'fwx_app_center',
		'lucky': 'lucky',
		'ttyd': 'terminal',
		'upnp': 'upnp',
		'switch': 'switch',
		'routesj': 'routes',
		'iptables': 'firewall',
		'nftables': 'firewall',
		'channel_analysis': 'channels',
		'graphs': 'graphs',
		'collectd': 'settings',
		'fwx_network': 'fwx_network',
		'fwx_network_service': 'fwx_network_service',
		'fwx_wireless': 'fwx_wireless',
		'fwx_parental_control': 'fwx_parental_control',
		'fwx_advance': 'fwx_advance',
		'fwx_dashboard': 'fwx_dashboard',
		'fwx_internet_record': 'fwx_internet_record',
		'fwx_user': 'fwx_user',
		'fwx_monitor': 'fwx_monitor',
		'fwx_app_center': 'fwx_app_center',
		'fwx_tools': 'fwx_tools',
		'fwx_games': 'fwx_games',
		'fwx_cloud_service': 'fwx_cloud_service',
		'fwx_ac': 'fwx_ac',
		'fwx_harbor_file': 'fwx_harbor_file'
	},
	// Some LuCI child names also occur as top-level categories.
	menuPathIcons: {
		'admin/network/network': 'interfaces',
		'admin/system/admin': 'account',
		'admin/system/startup': 'startup',
		'admin/system/crontab': 'schedule',
		'admin/system/leds': 'leds',
		'admin/system/system': 'settings',
		'admin/fwx_network/work_mode': 'settings',
		'admin/fwx_network/lan': 'interfaces',
		'admin/fwx_network/wan': 'dns',
		'admin/fwx_monitor/session_stat': 'sessions',
		'admin/fwx_monitor/user_record': 'device-records',
		'admin/fwx_monitor/traffic_stat': 'graphs',
		'admin/fwx_wireless/radio': 'fwx_wireless',
		'admin/fwx_wireless/interface': 'interfaces',
		'admin/fwx_parental_control/appfilter': 'fwx_app_center',
		'admin/fwx_parental_control/macfilter': 'fwx_parental_control',
		'admin/fwx_parental_control/mac_blacklist': 'firewall',
		'admin/fwx_advance/dashboard_setting': 'fwx_dashboard',
		'admin/fwx_advance/fwx_feature': 'processes',
		'admin/fwx_advance/system': 'settings',
		'admin/fwx_internet_record/base_setting': 'settings',
		'admin/fwx_internet_record/record_whitelist': 'fwx_check',
		'admin/fwx_user/list': 'fwx_user',
		'admin/fwx_user/detail': 'account'
	},
	defaultIcon: 'default',
	getMenuIcon(path, name, level) {
		return this.menuPathIcons[path] || this.menuIcons[name] || (level === 0 ? this.defaultIcon : 'submenu');
	},
	__init__() {
		ui.menu.load().then(L.bind(this.render, this));
	},

	render(tree) {
		this.renderModeMenu(tree);
		this.renderCategoryNav();
		this.renderBreadcrumb(tree);
		this.setup_mobile_menu();
		this.setup_sidebar();
		this.setup_dropdowns();
		this.setup_content_scrollbar();
		const category = L.env.dispatchpath[1]
			? (this.getMenuCategory(L.env.dispatchpath[1]) === 'menu-item-basic' ? 'basic' : 'advanced')
			: localStorage.getItem('luci-menu-category') || 'basic';
		this.switchCategory(category);

		let node = tree;
		let url = '';
		for (let i = 0; i < 3 && node && L.env.dispatchpath.length >= 3; i++) {
			node = node.children && node.children[L.env.dispatchpath[i]];
			url += (url ? '/' : '') + L.env.dispatchpath[i];
		}
		if (node && L.env.dispatchpath.length >= 3)
			this.renderTabMenu(node, url, 0);
	},

	setup_sidebar() {
		const sidebar = document.querySelector('.sidebar-nav');
		const button = E('button', {
			'class': 'sidebar-toggle', 'type': 'button',
			'aria-controls': 'theme-sidebar', 'aria-expanded': 'true'
		}, [
			E('span', { 'class': 'sidebar-toggle-icon', 'aria-hidden': 'true' }),
			E('span', { 'class': 'sidebar-toggle-label' })
		]);
		sidebar.appendChild(E('div', { 'class': 'sidebar-footer' }, [button]));
		const apply = (collapsed) => {
			document.documentElement.classList.toggle('sidebar-collapsed', collapsed);
			button.setAttribute('aria-expanded', String(!collapsed));
			const action = collapsed ? 'Expand menu' : 'Collapse menu';
			const translated = collapsed ? _('Expand menu') : _('Collapse menu');
			const theme_translations = window.fanchmwrtThemeTranslations || {};
			const chinese = theme_translations.zh || {};
			button.title = translated === action && /^zh(?:[-_]|$)/i.test(document.documentElement.lang)
				? (chinese[action] || translated) : translated;
			button.setAttribute('aria-label', button.title);
			button.querySelector('.sidebar-toggle-label').textContent = button.title;
		};
		apply(localStorage.getItem('luci-sidebar-collapsed') === 'true');
		button.addEventListener('click', () => {
			const collapsed = !document.documentElement.classList.contains('sidebar-collapsed');
			apply(collapsed);
			localStorage.setItem('luci-sidebar-collapsed', String(collapsed));
		});
		const close = () => {
			clearTimeout(this.sidebar_flyout_close_timer);
			document.querySelectorAll('.sidebar-flyout').forEach((menu) => {
				menu.parentElement.classList.remove('open');
				menu.parentElement.querySelector('a.menu').setAttribute('aria-expanded', 'false');
				if (menu.hasAttribute('popover')) menu.hidePopover();
				menu.removeAttribute('popover');
				menu.classList.remove('sidebar-flyout');
				menu.style.cssText = '';
			});
		};
		this.close_sidebar_flyouts = close;
		button.addEventListener('click', close);
		document.addEventListener('click', (event) => {
			if (!event.target.closest('.sidebar-nav')) close();
		});
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') close();
		});
		window.addEventListener('resize', close);
		document.getElementById('topmenu').addEventListener('scroll', close, { passive: true });
	},

	// Keep lists in their widget DOM so LuCI selection and keyboard handlers still work.
	// The browser top layer escapes overflow clipping in tables, cards and modals.
	setup_dropdowns() {
		const active = new Map();
		const place = (widget, list) => {
			const rect = widget.getBoundingClientRect();
			const width = document.documentElement.clientWidth;
			const height = window.innerHeight;
			const below = height - rect.bottom - 8;
			const above = rect.top - 8;
			// Popovers resolve percentage widths against the viewport. Anchor the
			// width to the control, never to the list's previous scrollWidth.
			const listWidth = Math.min(rect.width, width - 16);
			Object.assign(list.style, {
				position: 'fixed', margin: '0', right: 'auto',
				left: Math.max(8, Math.min(rect.left, width - listWidth - 8)) + 'px',
				width: listWidth + 'px', minWidth: '0', maxWidth: width - 16 + 'px'
			});
			const down = below >= Math.min(320, list.scrollHeight) || below >= above;
			Object.assign(list.style, {
				top: down ? rect.bottom + 'px' : 'auto',
				bottom: down ? 'auto' : height - rect.top + 'px',
				maxHeight: Math.max(0, Math.min(320, down ? below : above)) + 'px'
			});
		};
		new MutationObserver((records) => {
			for (const record of records) {
				const widget = record.target;
				if (!widget.matches('.cbi-dropdown')) continue;
				if (widget.hasAttribute('open')) {
					if (active.has(widget)) continue;
					const list = widget.querySelector('ul.dropdown');
					if (!list) continue;
					active.set(widget, [list, list.style.cssText]);
					place(widget, list);
					if (typeof list.showPopover === 'function') {
						list.setAttribute('popover', 'manual');
						list.showPopover();
					}
					// Run after LuCI's own animation-frame positioning.
					requestAnimationFrame(() => {
						if (widget.hasAttribute('open')) place(widget, list);
					});
				} else if (active.has(widget)) {
					const [list, style] = active.get(widget);
					if (list.hasAttribute('popover')) {
						list.hidePopover();
						list.removeAttribute('popover');
					}
					list.style.cssText = style;
					list.style.top = list.style.bottom = list.style.maxHeight = '';
					active.delete(widget);
				}
			}
		}).observe(document.body, { subtree: true, attributes: true, attributeFilter: ['open'] });
		document.addEventListener('scroll', (event) => {
			active.forEach(([list], widget) => {
				if (widget.isConnected && !list.contains(event.target)) place(widget, list);
			});
		}, true);
		window.addEventListener('resize', () => active.forEach(([list], widget) => place(widget, list)));
	},

	setup_content_scrollbar() {
		const content = document.getElementById('maincontent');
		if (!content)
			return;
		let hide_timer;
		const show_scrollbar = () => {
			content.classList.add('scrollbar_active');
			clearTimeout(hide_timer);
			hide_timer = setTimeout(() => content.classList.remove('scrollbar_active'), 1000);
		};
		content.addEventListener('scroll', show_scrollbar, { passive: true });
		content.addEventListener('wheel', show_scrollbar, { passive: true });
	},

	setup_mobile_menu() {
		const toggle = document.querySelector('.mobile-menu-toggle');
		const sidebar = document.querySelector('.sidebar-nav');
		const media_query = window.matchMedia('(max-width: 768px)');
		const set_open = (open) => {
			sidebar.classList.toggle('mobile-open', open);
			toggle.setAttribute('aria-expanded', String(open));
		};
		toggle.addEventListener('click', () => set_open(!sidebar.classList.contains('mobile-open')));
		document.addEventListener('click', (event) => {
			if (!sidebar.contains(event.target) && !toggle.contains(event.target))
				set_open(false);
		});
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape' && sidebar.classList.contains('mobile-open')) {
				set_open(false);
				toggle.focus();
			}
		});
		media_query.addEventListener('change', () => set_open(false));
	},

	renderCategoryNav() {
		const savedCategory = localStorage.getItem('luci-menu-category') || 'basic';
		
		const titleText = (
			(L && L.env && L.env.hostname) ||
			(document.querySelector('header a.brand') && document.querySelector('header a.brand').textContent || '').trim() ||
			'FanchmWrt'
		);
		const brandElement = E('a', { 'class': 'top-navbar-brand', 'href': L.url('admin', 'fwx_dashboard') }, [
			E('span', { 'class': 'top-navbar-title' }, [titleText])
		]);
		brandElement.addEventListener('click', function() {
			localStorage.setItem('luci-menu-category', 'basic');
		});
		document.querySelector('.sidebar_brand').addEventListener('click', function() {
			localStorage.setItem('luci-menu-category', 'basic');
		});
		
		const createModeItem = (category, title, href) => {
			const item = E('li', {
				'class': 'mode-item' + (savedCategory === category ? ' active' : ''),
				'data-category': category
			}, [
				E('a', { 'href': href }, [
					E('span', { 'class': 'mode-check', 'aria-hidden': 'true' }),
					E('span', { 'class': 'mode-title' }, [_(title)])
				])
			]);

			item.querySelector('a').addEventListener('click', function() {
				localStorage.setItem('luci-menu-category', category);
			});

			return item;
		};

		const modeMenu = E('div', { 'class': 'top-user-menu top-mode-menu' }, [
			E('button', {
				'class': 'top-user-button top-more-button',
				'type': 'button',
				'aria-label': _('Mode menu')
			}, [
				E('span', { 'class': 'mode_button_label' }, [savedCategory === 'advanced' ? _('Advanced Mode') : _('Normal Mode')]),
				E('span', { 'class': 'top-more-icon' }, ['⋮'])
			]),
			E('ul', { 'class': 'top-user-dropdown top-mode-dropdown' }, [
				createModeItem('basic', 'Normal Mode', L.url('admin', 'fwx_dashboard')),
				createModeItem('advanced', 'Advanced Mode', L.url('admin', 'status', 'overview'))
			])
		]);

		const userMenu = E('div', { 'class': 'top-user-menu top-profile-menu' }, [
			E('button', {
				'class': 'top-user-button',
				'type': 'button',
				'aria-label': _('User menu')
			}, [
				E('span', { 'class': 'top-user-icon', 'aria-hidden': 'true' })
			]),
			E('ul', { 'class': 'top-user-dropdown top-profile-dropdown' }, [
				E('li', { 'class': 'system-item' }, [
					E('a', { 'href': L.url('admin', 'system', 'reboot') }, [_('Device Reboot')])
				]),
				E('li', { 'class': 'system-item' }, [
					E('a', { 'href': L.url('admin', 'system', 'flash') }, [_('System Upgrade')])
				]),
				E('li', { 'class': 'system-item' }, [
					E('a', { 'href': L.url('admin', 'system', 'admin') }, [_('Change Password')])
				]),
				E('li', { 'class': 'logout-item' }, [
					E('a', { 'href': '#' }, [_('Logout')])
				])
			])
		]);

		const closeTopMenus = () => {
			userMenu.classList.remove('open');
			modeMenu.classList.remove('open');
		};

		const userBtn = userMenu.querySelector('.top-user-button');
		userBtn.addEventListener('click', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			const shouldOpen = !userMenu.classList.contains('open');
			closeTopMenus();
			if (shouldOpen) {
				userMenu.classList.add('open');
			}
		});

		const modeBtn = modeMenu.querySelector('.top-more-button');
		modeBtn.addEventListener('click', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			const shouldOpen = !modeMenu.classList.contains('open');
			closeTopMenus();
			if (shouldOpen) {
				modeMenu.classList.add('open');
			}
		});

		userMenu.querySelectorAll('.system-item a').forEach((link) => {
			link.addEventListener('click', function() {
				localStorage.setItem('luci-menu-category', 'advanced');
				closeTopMenus();
			});
		});

		const logoutLink = userMenu.querySelector('.logout-item a');
		logoutLink.addEventListener('click', function(ev) {
			ev.preventDefault();
			ev.stopPropagation();
			closeTopMenus();
			window.dispatchEvent(new CustomEvent('logout', {
				detail: { source: 'top-profile-menu' }
			}));
			window.location.href = L.url('admin', 'logout');
		});

		document.addEventListener('click', function(ev) {
			if (!userMenu.contains(ev.target) && !modeMenu.contains(ev.target)) {
				closeTopMenus();
			}
		});

		document.addEventListener('keydown', function(ev) {
			if (ev.key === 'Escape') {
				closeTopMenus();
			}
		});

		const topNavbarContent = E('div', { 'class': 'top-navbar-content' }, [
			E('button', {
				'class': 'mobile-menu-toggle', 'type': 'button',
				'aria-label': _('Menu'), 'aria-controls': 'theme-sidebar',
				'aria-expanded': 'false'
			}, ['☰']),
			brandElement,
			E('div', { 'class': 'top_navbar_context' }, [document.title]),
			E('div', { 'class': 'top-navbar-right' }, [userMenu, modeMenu])
		]);
		const topNavbar = E('div', { 'class': 'top-navbar' }, [topNavbarContent]);

		const existing_navbar = document.querySelector('.top-navbar');
		if (existing_navbar)
			existing_navbar.remove();
		document.body.insertBefore(topNavbar, document.body.firstChild);
	},
	

	renderBreadcrumb(tree) {
		if (!L.env.dispatchpath || L.env.dispatchpath.length === 0) {
			return;
		}

		const breadcrumbItems = [];
		let currentNode = tree;
		let currentPath = '';

		for (let i = 0; i < L.env.dispatchpath.length && currentNode; i++) {
			const pathSegment = L.env.dispatchpath[i];
			currentPath += (currentPath ? '/' : '') + pathSegment;
			
			if (currentNode.children && currentNode.children[pathSegment]) {
				currentNode = currentNode.children[pathSegment];
				
				if (i === 0 && pathSegment === 'admin') {
					const homeItem = E('li', { 'class': 'home-item' }, [
						E('a', { 'href': L.url('admin', 'fwx_dashboard'), 'title': _('Home'), 'aria-label': _('Home') }, [
							E('span', { 'class': 'home-icon', 'aria-hidden': 'true' }, ['🏠'])
						])
					]);
					breadcrumbItems.push(homeItem);
				} else {
					const breadcrumbItem = E('li', {}, [
						E('span', {}, [_(currentNode.title)])
					]);
					
					breadcrumbItems.push(breadcrumbItem);
				}
			}
		}

		if (breadcrumbItems.length === 0) {
			return;
		}

		const breadcrumbContainer = E('div', { 'class': 'breadcrumb-container' }, [
			E('ol', { 'class': 'breadcrumb' }, breadcrumbItems)
		]);
		const navbar_context = document.querySelector('.top_navbar_context');
		if (navbar_context) {
			const navbar_breadcrumb = breadcrumbContainer.firstElementChild.cloneNode(true);
			navbar_breadcrumb.lastElementChild.setAttribute('aria-current', 'page');
			navbar_context.replaceChildren(navbar_breadcrumb);
		}

		const mainContent = document.querySelector('#maincontent') || document.querySelector('.main');
		if (mainContent) {
			const existingBreadcrumb = mainContent.querySelector('.breadcrumb-container');
			if (existingBreadcrumb) {
				existingBreadcrumb.remove();
			}
			
			mainContent.insertBefore(breadcrumbContainer, mainContent.firstChild);
		}
	},

	switchCategory(category) {
		const mode_label = document.querySelector('.mode_button_label');
		if (mode_label)
			mode_label.textContent = category === 'advanced' ? _('Advanced Mode') : _('Normal Mode');
		document.querySelectorAll('.top-user-dropdown .mode-item').forEach((item) => {
			item.classList.toggle('active', item.getAttribute('data-category') === category);
		});
		document.querySelectorAll('#topmenu > li').forEach((item) => {
			item.hidden = !item.classList.contains('menu-item-' + category);
		});
		localStorage.setItem('luci-menu-category', category);
	},

	getMenuCategory(menuName) {
		const normalizedName = (menuName || '').toLowerCase();
		if (normalizedName.startsWith('fwx')) {
			return 'menu-item-basic';
		}
		return 'menu-item-advanced';
	},

	renderTabMenu(tree, url, level) {
		level = level || 0;
		
		const container = document.querySelector('#tabmenu');
		const ul = E('ul', { 'class': 'tabs' });
		const children = ui.menu.getChildren(tree);
		let activeNode = null;

		children.forEach(child => {
			const isActive = (L.env.dispatchpath[3 + level] == child.name);
			const activeClass = isActive ? ' active' : '';
			const className = 'tabmenu-item-%s %s'.format(child.name, activeClass);

			ul.appendChild(E('li', { 'class': className }, [
				E('a', { 'href': L.url(url, child.name) }, [ _(child.title) ] )]));

			if (isActive)
				activeNode = child;
		});

		if (ul.children.length == 0)
			return E([]);

		container.appendChild(ul);
		container.style.display = '';

		if (activeNode)
			this.renderTabMenu(activeNode, url + '/' + activeNode.name, level + 1);

		return ul;
	},

	renderMainMenu(tree, url, level) {
		level = level || 0;
		const ul = level === 0 ? document.querySelector('#topmenu') : E('ul', { 'class': 'dropdown-menu' });
		if (level > 1)
			return ul;
		ui.menu.getChildren(tree).forEach((child) => {
			const submenu = this.renderMainMenu(child, url + '/' + child.name, level + 1);
			const has_submenu = level === 0 && submenu.children.length > 0;
			const is_active = L.env.dispatchpath[level + 1] === child.name && L.env.dispatchpath[level] === tree.name;
			const classes = level === 0 ? [this.getMenuCategory(child.name)] : [];
			if (has_submenu) classes.push('dropdown');
			if (is_active) {
				classes.push(has_submenu ? 'current_group' : 'active');
				if (has_submenu) classes.push('open');
			}
			const link = E('a', {
				'class': (has_submenu ? 'menu ' : '') + 'menu-icon-' + this.getMenuIcon(url + '/' + child.name, child.name, level),
				'href': has_submenu ? '#' : L.url(url, child.name),
				'title': _(child.title), 'aria-label': _(child.title)
			}, [E('span', { 'class': 'menu-label' }, [_(child.title)])]);
			const li = E('li', { 'class': classes.join(' ') }, has_submenu ? [link, submenu] : [link]);
			if (has_submenu) {
				link.setAttribute('aria-expanded', String(is_active));
				const compact = () => document.documentElement.classList.contains('sidebar-collapsed') && window.matchMedia('(min-width: 769px)').matches;
				const set_open = (open) => {
					this.close_sidebar_flyouts();
					if (compact() && open) {
						const rect = link.getBoundingClientRect();
						submenu.classList.add('sidebar-flyout');
						if (typeof submenu.showPopover === 'function') {
							submenu.setAttribute('popover', 'manual');
							submenu.showPopover();
						}
						submenu.style.left = rect.right + 8 + 'px';
						submenu.style.top = Math.max(8, Math.min(rect.top, window.innerHeight - submenu.offsetHeight - 8)) + 'px';
					}
					ul.querySelectorAll(':scope > .dropdown.open').forEach((item) => {
						item.classList.remove('open');
						item.querySelector('a.menu').setAttribute('aria-expanded', 'false');
					});
					li.classList.toggle('open', open);
					link.setAttribute('aria-expanded', String(open));
				};
				link.addEventListener('click', (event) => {
					event.preventDefault();
					// Hover may have already opened it before the click arrives.
					set_open(compact() || !li.classList.contains('open'));
				});
				const hover_open = (event) => {
					if (event.pointerType === 'touch' || !compact()) return;
					clearTimeout(this.sidebar_flyout_close_timer);
					if (!submenu.classList.contains('sidebar-flyout')) set_open(true);
				};
				const hover_close = (event) => {
					if (event.pointerType === 'touch' || !compact()) return;
					clearTimeout(this.sidebar_flyout_close_timer);
					// Allow crossing the gap between the icon rail and its floating menu.
					this.sidebar_flyout_close_timer = setTimeout(() => {
						if (submenu.classList.contains('sidebar-flyout')) this.close_sidebar_flyouts();
					}, 200);
				};
				li.addEventListener('pointerenter', hover_open);
				li.addEventListener('pointerleave', hover_close);
				submenu.addEventListener('pointerenter', hover_open);
				submenu.addEventListener('pointerleave', hover_close);
				link.addEventListener('focus', () => {
					if (compact() && !submenu.classList.contains('sidebar-flyout')) set_open(true);
				});
			} else if (is_active) {
				link.setAttribute('aria-current', 'page');
			}
			ul.appendChild(li);
		});
		if (level === 0) ul.style.display = '';
		return ul;
	},

	renderModeMenu(tree) {
		const ul = document.querySelector('#modemenu');
		const menu = document.querySelector('#topmenu');
		ul.replaceChildren();
		menu.replaceChildren();
		ui.menu.getChildren(tree).forEach((child, index) => {
			const is_active = L.env.requestpath.length ? child.name === L.env.requestpath[0] : index === 0;
			ul.appendChild(E('li', { 'class': is_active ? 'active' : '' }, [
				E('a', { 'href': L.url(child.name) }, [_(child.title)])
			]));
			if (is_active) this.renderMainMenu(child, child.name);
		});
		ul.style.display = ul.children.length > 1 ? '' : 'none';
	}
});
