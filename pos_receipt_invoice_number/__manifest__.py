# -*- coding: utf-8 -*-
{
    'name': "POS Receipt Show Invoice Number",
    'version': '1.0.1',
    'category': 'Point of Sale',
    'author': 'TL Technology',
    'live_test_url': 'http://posodoo.com/web/signup',
    'price': '0',
    'website': 'http://posodoo.com',
    'sequence': 0,
    'depends': [
        'point_of_sale',
        'account',
        'account_invoice_megaprint'
    ],
    'demo': [
    ],
    'data': [
        'security/ir.model.access.csv',
        'template/import_library.xml',
        'views/pos_config.xml',
        'views/pos_order.xml',
    ],
    'qweb': ['static/src/xml/pos.xml'],
    'images': ['static/description/icon.png'],
    'post_init_hook': 'auto_action_after_install',
}
