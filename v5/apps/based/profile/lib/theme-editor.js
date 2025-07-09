export default function themeEditor(themeName) {
    let themeData = this.bp.apps.themes.themes[themeName];
    let themeStyles = themeData.styles || {};

    // Create a deep copy so edits don't mutate original
    let editableTheme = JSON.parse(JSON.stringify(themeData));

    // Target container and clear it
    let themeStylesContainer = $('.theme-styles', this.profileWindow.content);
    themeStylesContainer.html(''); // clear previous content

    for (let styleName in themeStyles) {
        let styleValue = themeStyles[styleName];

        // Top-level style wrapper
        let styleDiv = $('<div class="theme-style"></div>');
        let contentDiv = $('<div class="theme-style-content"></div>');

        contentDiv.append(`<div class="style-title">${styleName}</div>`);

        for (let prop in styleValue) {
            let val = styleValue[prop];
            let inputId = `input_${styleName}_${prop}`.replace(/\W+/g, '_');

            let colorInput = '';
            if (isColorProperty(prop, val)) {
                let safeColor = val.startsWith('#') ? val : '#ffffff';
                colorInput = `<input type="color" value="${safeColor}" data-style="${styleName}" data-prop="${prop}" class="color-picker" />`;
            }

            contentDiv.append(`
                <div class="prop-row">
                    <label class="prop-name">${prop}:</label>
                    <input type="text" id="${inputId}" value="${val}" data-style="${styleName}" data-prop="${prop}" />
                    ${colorInput}
                </div>
            `);
        }

        // TODO: keep this commented for future use
        /*
        contentDiv.append(`
            <div class="prop-row">
                <label class="prop-name">+</label>
                <input type="text" class="new-prop-name" placeholder="property" data-style="${styleName}" />
                <input type="text" class="new-prop-value" placeholder="value" data-style="${styleName}" />
                <button class="add-prop-btn" data-style="${styleName}">Add</button>
            </div>
        `);
        */

        styleDiv.append(contentDiv);
        themeStylesContainer.append(styleDiv);
    }

    // 🔁 Listen to changes and update theme live
    themeStylesContainer.on('input', 'input[type="text"], input.color-picker', function (e) {
        $('.themeSelect', this.profileWindow.content).val('Custom');

        let style = $(e.target).data('style');
        let prop = $(e.target).data('prop');
        if (!style || !prop) return;

        let newValue = $(e.target).val();

        // Sync color picker and text input
        if ($(e.target).hasClass('color-picker')) {
            let closestTextInput = $(e.target).closest('.prop-row').find('input[type="text"]');
            closestTextInput.val(newValue);
        }

        editableTheme.styles[style][prop] = newValue;
        editableTheme.name = 'Custom';
        this.bp.apps.themes.applyTheme(editableTheme);
    }.bind(this));

    // ➕ Add new property
    themeStylesContainer.on('click', '.add-prop-btn', function (e) {
        let style = $(e.target).data('style');
        let row = $(e.target).closest('div');
        let propInput = row.find('.new-prop-name');
        let valInput = row.find('.new-prop-value');

        let newProp = propInput.val().trim();
        let newVal = valInput.val().trim();

        if (newProp && newVal) {
            editableTheme.styles[style][newProp] = newVal;
            $('.themeSelect', this.profileWindow.content).trigger('change');
        }
    }.bind(this));

    // ❌ Remove property
    themeStylesContainer.on('click', '.remove-prop-btn', function (e) {
        let style = $(e.target).data('style');
        let prop = $(e.target).data('prop');
        delete editableTheme.styles[style][prop];
        $('.themeSelect', this.profileWindow.content).trigger('change');
    }.bind(this));

    console.log('themeData', themeData);
}

function isColorProperty(prop, value) {
    const colorProps = [
        'color', 'background', 'background-color', 'border-color',
        'outline-color', 'text-decoration-color', 'column-rule-color',
        'fill', 'stroke'
    ];

    const isColorKey = colorProps.includes(prop.toLowerCase());

    const colorRegex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
        || /^rgba?\(.+\)$/i
        || /^hsla?\(.+\)$/i
        || /^[a-z]+$/i; // named colors

    const isColorValue = colorRegex.test(value);

    return isColorKey || isColorValue;
}
