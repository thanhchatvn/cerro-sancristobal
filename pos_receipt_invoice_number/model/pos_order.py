# -*- coding: utf-8 -*-
from odoo import api, fields, models, _

class PosOrder(models.Model):
    _inherit = "pos.order"

    fel_serie = fields.Char('Serie Fel', related="account_move.fel_serie")
    fel_number = fields.Char('Numero Fel', related="account_move.fel_no")
    fel_date = fields.Char('Fecha Fel', related="account_move.fel_date")
    fel_uuid = fields.Char('UUID Fel', related="account_move.uuid")