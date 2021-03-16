# -*- coding: utf-8 -*-
{
	'name' : 'Print Invoice Number On POS Receipt App',
	'author': "Edge Technologies",
	'version' : '14.0.1.0',
	'live_test_url':'https://youtu.be/Zk_vvORqF7A',
	"images":['static/description/main_screenshot.png'],
	'summary' : 'Apps for print Invoice Number On POS Receipt print invoice number on point of sales receipt Invoice number on point of sale receipt invoice number on receipt of pos print invoice number on point of sales receipt print invoice number on receipt Print',
	'description' : """
		This module helps to Display Invoice Number in Pos Ticket. """,
	'depends' : ['base','point_of_sale'],
	"license" : "OPL-1",
	'data' : [
		'views/invoice_number_print.xml',
	],
	'qweb' : ['static/src/xml/invoice_number_printpos.xml'],
	'demo' : [],
	'installable' : True,
	'auto_install' : False,
	'price': 5,
	'category' : 'Point Of Sales',
	'currency': "EUR",
}
# vim:expandtab:smartindent:tabstop=4:softtabstop=4:shiftwidth=4:
