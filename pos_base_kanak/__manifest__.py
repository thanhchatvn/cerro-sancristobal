# -*- coding: utf-8 -*-
###############################################################################
# Author      : Kanak Infosystems LLP. (<http://kanakinfosystems.com/>)
# Copyright(c): 2012-Present Kanak Infosystems LLP.
# All Rights Reserved.
#
#
# This program is copyright property of the author mentioned above.
# You can`t redistribute it and/or modify it.
#
#
# You should have received a copy of the License along with this program.
# If not, see <http://kanakinfosystems.com/license>
###############################################################################
{
    'name': 'POS Base kanak',
    'summary': 'This odoo module is the base module of various pos reports - pos_item_sale_report, pos_hourly_sales_report, pos_table_sales_report, pos_item_inventory_report, pos_receipt_information, and pos_void_report.',
    'author': 'Kanak Infosystems LLP.',
    'description': """
POS Base Module
====================================================================================
    """,
    'version': '1.0',
    'images': ['static/description/banner.jpg'],
    'license': 'OPL-1',
    'website': 'http://www.kanakinfosystems.com',
    'depends': [
        'point_of_sale',
        'pos_restaurant',
        'stock_account'],
    'data': [
        'reports/report_views.xml',
    ],
    'installable': True,
    'price': 0.0,
    'currency': 'EUR',
}
