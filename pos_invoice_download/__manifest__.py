# -*- coding: utf-8 -*-

{
	'name': 'POS Invoice Download -MegaPrint-',
	'category': 'Point of Sale',
	'summary': 'Descargar binanrio de factura electronica firmada',
	'version': '1.0',
	'sequence': 1,
	'depends': ['point_of_sale', 'account_invoice_megaprint'],
	'author':'Xetechs, S.A.',
	'website': 'https://www.xetechs.com',
	'support': 'Luis Aquino -> laquino@xetechs.com',
	'data': [
		'views/pos_order_views.xml',
		'views/templates.xml',
	],
	'installable': True,
	'application': True,
	'auto_install': False,
}
