
// BiProductScreen js
odoo.define('pos_all_in_one.BiProductScreen', function(require) {
	"use strict";

	const models = require('point_of_sale.models');
	const PosComponent = require('point_of_sale.PosComponent');
	const Registries = require('point_of_sale.Registries');
	const Session = require('web.Session');
	const chrome = require('point_of_sale.Chrome');
	const ControlButtonsMixin = require('point_of_sale.ControlButtonsMixin');
	const NumberBuffer = require('point_of_sale.NumberBuffer');
	const { useListener } = require('web.custom_hooks');
	const { onChangeOrder, useBarcodeReader } = require('point_of_sale.custom_hooks');
	const { useState } = owl.hooks;

	const ProductScreen = require('point_of_sale.ProductScreen'); 

	const BiProductScreen = (ProductScreen) =>
		class extends ProductScreen {
			constructor() {
				super(...arguments);
			}
			async _clickProduct(event) {
				var self = this;
				const product = event.detail;
				if (product.product_variant_count > 1) {
					var prod_template = this.env.pos.db.product_template_by_id[product.product_tmpl_id];
					var prod_list = [];
					prod_template.product_variant_ids.forEach(function (prod) {
						prod_list.push(self.env.pos.db.get_product_by_id(prod));
					});			
					// this.product_template_list_widget.set_product_list(prod_list);
					this.showPopup('ProductTemplatePopupWidget', {'variant_ids':prod_list});
				} else {
					// super._clickProduct(event);
					let allow_order = self.env.pos.config.pos_allow_order;
					let deny_order= self.env.pos.config.pos_deny_order;
					let call_super = true;
					if(self.env.pos.config.pos_display_stock)
					{
						if(self.env.pos.config.show_stock_location == 'specific' && product.type == 'product')
						{
							var partner_id = self.env.pos.get_client();
							var location = self.env.pos.locations;
							await this.rpc({
								model: 'stock.quant',
								method: 'get_single_product',
								args: [partner_id ? partner_id.id : 0,product.id, location],
							}).then(function(output) {
								if (allow_order == false)
								{
									if ( (output[0][1] <= deny_order) || (output[0][1] <= 0) )
									{
										call_super = false;
										self.showPopup('ErrorPopup', {
											title: self.env._t('Deny Order'),
											body: self.env._t("Deny Order" + "(" + product.display_name + ")" + " is Out of Stock."),
										});
									}
								}
								else if(allow_order == true)
								{
									if (output[0][1] <= deny_order)
									{
										call_super = false;
										self.showPopup('ErrorPopup', {
											title: self.env._t('Deny Order'),
											body: self.env._t("Deny Order" + "(" + product.display_name + ")" + " is Out of Stock."),
										});
									}
								}
							});
						}
						else{
							if (product.type == 'product' && allow_order == false)
							{
								if (product.qty_available <= deny_order && allow_order == false)
								{
									call_super = false; 
									self.showPopup('ErrorPopup', {
										title: self.env._t('Deny Order'),
										body: self.env._t("Deny Order" + "(" + product.display_name + ")" + " is Out of Stock."),
									});
								}
								else if (product.qty_available <= 0 && allow_order == false)
								{
									call_super = false; 
									self.showPopup('ErrorPopup', {
										title: self.env._t('Error: Out of Stock'),
										body: self.env._t("(" + product.display_name + ")" + " is Out of Stock."),
									});
								}
							}
							else if(product.type == 'product' && allow_order == true && product.qty_available <= deny_order){
								call_super = false; 
								self.showPopup('ErrorPopup', {
									title: self.env._t('Error: Out of Stock'),
									body: self.env._t("(" + product.display_name + ")" + " is Out of Stock."),
								});
							}
						}
					}
					if(call_super){
						super._clickProduct(event);
					}
				}
			}
		};

	Registries.Component.extend(ProductScreen, BiProductScreen);

	return ProductScreen;

});
