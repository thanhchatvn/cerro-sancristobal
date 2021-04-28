from odoo import models, fields, api



class PosConfig(models.Model):
    _inherit = "pos.config"

    iface_order_merge = fields.Boolean(
        string="Order Merge",
        help="Enables Order Merging in the Point of Sale",
        default=True,
    )
