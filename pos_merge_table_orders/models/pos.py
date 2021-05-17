# -*- coding: utf-8 -*-

from odoo import api, fields, models, tools, _

class pos_config(models.Model):
    _inherit = 'pos.config' 

    allow_merge_table_orders = fields.Boolean('Allow merge table orders', default=True)
