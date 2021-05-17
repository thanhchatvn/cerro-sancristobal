odoo.define('pos_merge_table_orders', function(require){
    const PosComponent = require('point_of_sale.PosComponent');
    const ProductScreen = require('point_of_sale.ProductScreen');
    const { useListener } = require('web.custom_hooks');
    const Registries = require('point_of_sale.Registries');
    const models = require('point_of_sale.models');
    const { useState, useRef } = owl.hooks;
    const AbstractAwaitablePopup = require('point_of_sale.AbstractAwaitablePopup');



    class MergeTableButton extends PosComponent {
        constructor() {
            super(...arguments);
            useListener('click', this.onClick);
        }
        async onClick() {
            var self = this;
            var table_list = []
            var selected_table = self.env.pos.table;
            $.each(self.env.pos.tables_by_id, function (i, table) {
                if(selected_table.id != table.id){
                    var orders = self.env.pos.get_table_orders(table);
                    if(orders.length > 0){
                        table_list.push(table);
                    }
                }
            });
            const { confirmed, payload: inputNote } = await this.showPopup('MergeTableOrder', {
                table_list:table_list,
            });
        }
    }
    MergeTableButton.template = 'MergeTableButton';

    ProductScreen.addControlButton({
        component: MergeTableButton,
        condition: function() {
            return this.env.pos.config.allow_merge_table_orders;
        },
    });

    Registries.Component.add(MergeTableButton);

    class MergeTableOrder extends AbstractAwaitablePopup {
        constructor() {
            super(...arguments);
            useListener('floor_button', this.floor_button);
        }
        floor_button(event){
            const table_id = event.detail;
            if($(".merge-table"+table_id).hasClass("selected-marge-table")){
                $(".merge-table"+table_id).removeClass("selected-marge-table");
            }
            else{
                $(".merge-table"+table_id).addClass("selected-marge-table");
            } 

        }

        merge_table(event){
            var self = this;
            var table_list = [];
            var order = self.env.pos.get_order();
            $.each($(".merge-table.selected-marge-table"), function (i,table) {
                var orders = self.env.pos.get_table_orders(self.env.pos.tables_by_id[$(table).data("table_id")]);
                for(var k=0;k<orders.length;k++){
                    var order_line = orders[k].get_orderlines();
                    for(var j=0;j<order_line.length;j++){
                        order.add_product(order_line[j].product,{'quantity':order_line[j].quantity,'price':order_line[j].price,'discount':order_line[j].discount});
                    }
                    orders[k].destroy({'reason':'abandon'});
                }

            });
            this.trigger('close-popup');
        }
    }
    MergeTableOrder.template = 'MergeTableOrder';

    Registries.Component.add(MergeTableOrder);
});
