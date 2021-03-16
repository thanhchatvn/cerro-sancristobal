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
						self.currentOrder.fel_uuid = output[0]['fel_uuid']
						self.currentOrder.fel_serie = output[0]['fel_serie']
						self.currentOrder.fel_number = output[0]['fel_number']
						self.currentOrder.fel_date = output[0]['fel_date']
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
});