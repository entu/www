function getSignedData(user, key, data) {
    if(!user || !key) return;

    var conditions = []
    for(k in data) {
        conditions.push({k: data[k]});
    };

    var expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + 10);

    data['user'] = user;
    data['policy'] = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(JSON.stringify({expiration: expiration.toISOString(), conditions: conditions})));
    data['signature'] = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA1(data['policy'], key));

    return data;
}

$(document).ready(function() {

    var rnd = Math.floor((Math.random() * 10) + 1);

    $('#header-img').css('background-image', 'url(\'images/backgrounds/bg-'+rnd+'.png\')');

    $('a[href^="#"]').click(function() {
        $('html,body').animate({ scrollTop: $(this.hash).offset().top}, 400);
        return false;
        e.preventDefault();
    });

    $('a.thumbnail').fancybox({
        'padding': 0,
        'margin' : 50,
    });

    $(window).scroll(function() {
        console.log(($(window).scrollTop() * 0.3));
        $('#header-img').css('top', ($(window).scrollTop() * 0.3));
    });

    $('#join-submit').click(function() {
        $('#join-submit').hide();
        $.post('https://entu.entu.ee/api2/entity-210697', getSignedData(210718, 'nx9yEWrdXzSTecntG3DEx5aeWYWjAEkD', {
            'definition': 'customer',
            'customer-address': $('#join-name').val(),
            'customer-name': $('#join-company').val(),
            'customer-domain': $('#join-domain').val()+'.entu.ee',
            'customer-billing-email': $('#join-email').val(),
        }), function(data) {
            $.post('https://entu.entu.ee/api2/entity-'+data.result.id+'/share', getSignedData(210718, 'nx9yEWrdXzSTecntG3DEx5aeWYWjAEkD', {
                'to': 'info@entu.ee',
                'message': '',
            }), function(data) {
                $('#join-form').html('<div class="text-center"><b>Liitumine õnnestus.</b> Teiega võetakse peatselt ühendust.</div>');
            });
        });
    });

});
