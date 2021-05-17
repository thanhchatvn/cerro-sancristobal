# -*- coding: utf-8 -*-

{
    'name': 'Pos Merge Table Orders',
    'version': '1.0',
    'category': 'Point of Sale',
    'sequence': 6,
    'author': 'Webveer',
    'summary': 'Allows you to merge table order.',
    'description': "Allows you to merge table order.",
    'depends': ['pos_restaurant'],
    'data': [
        'views/views.xml',
    ],
    'qweb': [
        'static/src/xml/pos.xml',
    ],
    'images': [
        'static/description/select.jpg',
    ],
    'installable': True,
    'website': '',
    'auto_install': False,
    'price': 39,
    'currency': 'EUR',
}
