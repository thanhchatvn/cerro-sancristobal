# -*- coding: utf-8 -*-
# Part of Odoo. See LICENSE file for full copyright and licensing details.
import logging
from datetime import timedelta
from functools import partial

import psycopg2
import pytz

from odoo import api, fields, models, tools, _
from odoo.tools import float_is_zero
from odoo.exceptions import UserError
from odoo.http import request
from odoo.osv.expression import AND
import base64

_logger = logging.getLogger(__name__)


class PosOrder(models.Model):
	_inherit = "pos.order"
	
	txt_filename = fields.Char('Archivo', related="account_move.txt_filename")
	file = fields.Binary('Archivo', related="account_move.file")
	
	@api.model
	def get_fel(self, order):
		order_id = self.env['pos.order'].search([('id', '=', int(order['order_id']))])
		base_url = self.env['ir.config_parameter'].get_param('web.base.url')
		return {
			'type': 'ir.actions.act_url',
			'name': 'Factura Electroncia',
			'url': base_url + "/web/content/?model=" + "pos.order" +"&id=" + str(order_id.id) + "&filename_field=file_name&field=file&download=true&filename=" + str(order_id.txt_filename),
			'target': 'self',
		}
		
	def action_pos_order_invoice(self):
		moves = self.env['account.move']
		
		for order in self:
			# Force company for all SUPERUSER_ID action
			if order.account_move:
				moves += order.account_move
				continue

			if not order.partner_id:
				raise UserError(_('Please provide a partner for the sale.'))
			
			move_vals = order._prepare_invoice_vals()
			new_move = moves.sudo()\
							.with_context(default_type="out_invoice", force_company=order.company_id.id)\
							.create(move_vals)
			message = _("This invoice has been created from the point of sale session: <a href=# data-oe-model=pos.order data-oe-id=%d>%s</a>") % (order.id, order.name)
			new_move.message_post(body=message)
			order.write({'account_move': new_move.id, 'state': 'invoiced'})
			new_move.sudo().with_context(force_company=order.company_id.id).action_post()
			moves += new_move

		if not moves:
			return {}
			
		return {
			'name': _('Customer Invoice'),
			'view_mode': 'form',
			'view_id': self.env.ref('account.view_move_form').id,
			'res_model': 'account.move',
			'context': "{'type':'out_invoice'}",
			'type': 'ir.actions.act_window',
			'nodestroy': True,
			'target': 'current',
			'res_id': moves and moves.ids[0] or False,
		}

PosOrder()
