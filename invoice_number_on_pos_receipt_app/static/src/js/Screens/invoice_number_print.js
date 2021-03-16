odoo.define('invoice_number_on_pos_receipt_app.invoice_number_print', function (require){
  'use_strict';

	const PaymentScreen = require('point_of_sale.PaymentScreen');
	const { useListener } = require('web.custom_hooks');
	const Registries = require('point_of_sale.Registries');

	const PosInvPaymentScreen = (PaymentScreen) =>
		class extends PaymentScreen {
			constructor() {
				super(...arguments);
				// useListener('send-payment-adjust', this._sendPaymentAdjust);
			}

			async _finalizeValidation() {
				var self = this;
				if (this.currentOrder.is_paid_with_cash() && this.env.pos.config.iface_cashdrawer) {
					this.env.pos.proxy.printer.open_cashbox();
				}
				var domain = [['pos_reference', '=', this.currentOrder['name']]]
				var fields = ['account_move', 'fel_serie' ,'fel_number' ,'fel_date' ,'fel_uuid'];
  
				this.currentOrder.initialize_validation_date();
				this.currentOrder.finalized = true;

				let syncedOrderBackendIds = [];

				try {
					if (this.currentOrder.is_to_invoice()) {
						syncedOrderBackendIds = await this.env.pos.push_and_invoice_order(
							this.currentOrder
						);
					} else {
						syncedOrderBackendIds = await this.env.pos.push_single_order(this.currentOrder);
					}
				} catch (error) {
					if (error instanceof Error) {
						throw error;
					} else {
						await this._handlePushOrderError(error);
					}
				}
				// console.log(syncedOrderBackendIds.length,"RRRRRRRRRRRRRRR",this.currentOrder.wait_for_push_order())
				if (syncedOrderBackendIds.length && this.currentOrder.wait_for_push_order()) {
					const result = await this._postPushOrderResolve(
						this.currentOrder,
						syncedOrderBackendIds
					);
					if (!result) {
						await this.showPopup('ErrorPopup', {
							title: 'Error: no internet connection.',
							body: error,
						});
					}
				}
				if (this.currentOrder.is_to_invoice()) {
					this.rpc({
						model: 'pos.order',
						method: 'search_read',
						args: [domain, fields],
					})
					.then(function (output) {
						var inv_print = output[0]['account_move'][1].split(" ")[0]
						console.log( output  )
						self.currentOrder.invoice_number = inv_print
						self.showScreen(self.nextScreen);
					})
				}
				else{
					this.showScreen(this.nextScreen);
				}

				// If we succeeded in syncing the current order, and
				// there are still other orders that are left unsynced,
				// we ask the user if he is willing to wait and sync them.
				if (syncedOrderBackendIds.length && this.env.pos.db.get_orders().length) {
					const { confirmed } = await this.showPopup('ConfirmPopup', {
						title: this.env._t('Remaining unsynced orders'),
						body: this.env._t(
							'There are unsynced orders. Do you want to sync these orders?'
						),
					});
					if (confirmed) {
						// NOTE: Not yet sure if this should be awaited or not.
						// If awaited, some operations like changing screen
						// might not work.
						this.env.pos.push_orders();
					}
				}
			}
		};

	Registries.Component.extend(PaymentScreen, PosInvPaymentScreen);

	return PosInvPaymentScreen;



	// screens.PaymentScreenWidget.include({
	// 	finalize_validation: function() {
	// 	var self = this;
	// 	var order = this.pos.get_order();
	// 	if (order.is_paid_with_cash() && this.pos.config.iface_cashdrawer) { 
	// 			this.pos.proxy.printer.open_cashbox();
	// 	}
	// 	order.initialize_validation_date();
	// 	order.finalized = true;
	// 	if (order.is_to_invoice()) {
	// 		var invoiced = this.pos.push_and_invoice_order(order);
	// 		this.invoicing = true;
	// 		invoiced.catch(this._handleFailedPushForInvoice.bind(this, order, false));
	// 		invoiced.then(function (server_ids) {
	// 			self.invoicing = false;
	// 			var post_push_promise = [];
	// 			post_push_promise = self.post_push_order_resolve(order, server_ids);
	// 			post_push_promise.then(function () {
	// 				rpc.query({
	// 				model: 'pos.order',
	// 				method: 'search_read',
	// 				domain: [['pos_reference', '=', order['name']]],
	// 				fields: ['account_move'],
	// 				},{async:false})
	// 				.then(function(output){
	// 					var inv_print = output[0]['account_move'][1].split(" ")[0]
	// 					order.invoice_number = inv_print;
	// 					self.gui.show_screen('receipt');
	// 				});
	// 			}).catch(function (error) {
	// 				self.gui.show_screen('receipt');
	// 				if (error) {
	// 					self.gui.show_popup('error',{
	// 						'title': "Error: no internet connection",
	// 						'body': error,
	// 					});
	// 				}
	// 			});
	// 		});
	// 	} else {
	// 		var ordered = this.pos.push_order(order);
	// 		if(order.wait_for_push_order()){
	// 			var server_ids = [];
	// 			ordered.then(function (ids) {
	// 			server_ids = ids;
	// 			}).finally(function() {
	// 				var post_push_promise = [];
	// 				post_push_promise = self.post_push_order_resolve(order, server_ids);
	// 				post_push_promise.then(function () {
	// 				self.gui.show_screen('receipt');
	// 				}).catch(function (error) {
	// 					self.gui.show_screen('receipt');
	// 					if (error) {
	// 						self.gui.show_popup('error',{
	// 							'title': "Error: no internet connection",
	// 							'body':  error,
	// 						});
	// 					}
	// 				});
	// 			});
	// 		}
	// 		else {
	// 		  self.gui.show_screen('receipt');
	// 		}
	// 	}
	// },
	// });
});