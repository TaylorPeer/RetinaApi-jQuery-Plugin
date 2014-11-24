$.retinaApi.defaults.apiKey = apiKey;

QUnit.asyncTest("getRetinasTest", function (assert) {

    var callback = function (data) {
        assert.ok(data.length > 0 && (typeof data[0].retinaName != "undefined"), "API returned Retinas");
    };

    $.retinaApi.retinas.getRetinas(callback);

});