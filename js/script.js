(function (window, undefined) {
    if (!window['kp']) {
        window.kp = {}
        kp.init = function () {
            return new kp.BookingView()
        }
    }
    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g
    };
})(window);
(function ($) {
    kp.BookingModel = Backbone.Model.extend({
        defaults: {
            'firstName': '',
            'lastName': '',
            'diningDate': new Date(),
            'coversNo': 0,
            'phoneNumber': '',
            'email': '',
            'isSeated': false
        },
        toggleSeated: function () {
            this.save({ isSeated: !this.get("isSeated") })
        }
    })
    kp.BookingCollection = Backbone.Collection.extend({
        model: kp.BookingModel,
        localStorage: new Backbone.LocalStorage("kp-bookingStorage"),
        comparator: function (o) {
            return new Date(o.get('diningDate'))
        }
    })
    kp.BookingView = Backbone.View.extend({
        el: '#bookings',
        events: {
            "submit #bookingForm": "create",
            "click #add": "addNew"
        },
        initialize: function () {
            this.collection = new kp.BookingCollection()
            this.$bookings = this.$el.find('tbody')
            this.listenTo(this.collection, 'add', this.add)
            this.listenTo(this.collection, 'reset', this.addAll)
            this.collection.fetch({ reset: true })/*{}, {
                success: function (model, response) {
                    debugger
                    console.log("success");
                }
            })*/
        },
        create: function (e) {
            e.preventDefault()
            var attrs = this.serialize()
            this.collection.create(attrs, { sort: true })
        },
        add: function (book) {
            var view = new kp.SeatingView({ model: book }).render()
            var idx = this.collection.indexOf(book)
            if (idx == 0)
                this.$bookings.prepend(view.el)
            else
                this.$bookings.find('tr').eq(idx - 1).after(view.el)
            setTimeout(function () {
                view.$el.removeClass('new')
            }, 50)
        },
        addAll: function () {
            this.collection.each(this.add, this)
        },
        addNew: function () {
            var start = new Date()
            var end = new Date()
            end.setDate(end.getDate() + Math.random() * 10)
            var book = {
                firstName: Faker.Name.firstName(),
                lastName: Faker.Name.lastName(),
                diningDate: new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())),
                coversNo: Faker.Helpers.randomNumber(10),
                phoneNumber: Faker.PhoneNumber.phoneNumber(),
                email: Faker.Internet.email()
            }
            this.collection.create(book, { sort: true })
        },
        serialize: function () {
            return {
                firstName: this.$("[name='firstName']").val(),
                lastName: this.$("[name='lastName']").val(),
                diningDate: new Date(this.$("[name='diningDate']").val()),
                coversNo: this.$("[name='coversNo']").val(),
                phoneNumber: this.$("[name='phoneNumber']").val(),
                email: this.$("[name='email']").val()
            }
        }
    })
    kp.SeatingView = Backbone.View.extend({
        tagName: 'tr',
        className: 'new',
        template: _.template('<td><span>{{firstName}}</span></td><td><span>{{lastName}}</span></td><td><span>{{dateSting}}</span></td><td class="text-center"><span>{{noCovers}}</span></td><td><span>{{phoneNumber}}</span></td><td><span>{{email}}</span></td><td><div class="switch" data-on-label="Seated" data-off-label="Not arrived" data-on="success" data-off="warning"><input type="checkbox"{{seatedCheck}}></div></td><td class="rem"><a href="#"><i class="icon-remove-sign icon-large"></i></a></td>'),
        events: {
            'switch-change .switch': 'seated',
            'click a': 'clear'
        },
        initialize: function () {
            this.listenTo(this.model, 'destroy', this.remove)
        },
        render: function () {
            var coversNo = this.model.get('coversNo')
            var dDate = new Date(this.model.get('diningDate'))
            this.$el.html(this.template(_.extend(this.model.toJSON(), {
                noCovers: coversNo + ' people' + (coversNo > 1 ? 's' : ''),
                seatedCheck: this.model.get('isSeated') ? 'checked="checked"' : '',
                dateSting: dDate.toLocaleDateString() + ' - ' + dDate.toLocaleTimeString()
            })))
            this.$('.switch').bootstrapSwitch()
            return this
        },
        seated: function (e) {
            e.preventDefault()
            this.model.toggleSeated()
        },
        clear: function (e) {
            e.preventDefault()
            this.model.destroy()
        }
    })

})(jQuery);
$(function () {
    kp.init()
    $('.date').datetimepicker({
        format: "dd MM yyyy - hh:ii",
        autoclose: true,
        todayBtn: true,
        pickerPosition: "bottom-left",
        minuteStep: 15
    })
    $('input[required]').after('<i class="icon-ok ok"></i><i class="icon-remove-circle err" title="This field is required."></i>')
});