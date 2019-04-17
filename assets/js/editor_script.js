var DBbutton = (function (blocks, editor, components, i18n, element) {
    if (!DBDB) {
        var DBDB = {};
        DBDB.cfg = DESIGNBOLDCF;
    } else {
        DBDB.cfg = DESIGNBOLDCF;
    }

    const ALLOWED_MEDIA_TYPES = ['image'];

    var __ = i18n.__
    var el = element.createElement
    var registerBlockType = blocks.registerBlockType
    var RichText = editor.RichText
    var BlockControls = editor.BlockControls
    var AlignmentToolbar = editor.AlignmentToolbar
    var MediaUpload = editor.MediaUpload
    var Button = components.Button

    var iconEl = el(
        'svg', {
            xmlns: 'http://www.w3.org/2000/svg',
            id: 'Layer_1',
            x: '0px',
            y: '0px',
            viewBox: '0 0 25 25',
            version: '1.1',
            width: '20',
            height: '20'
        },

        el('g', {},
            el('g', {},
                el('polygon', {
                    className: 'dbdb_st0',
                    points: '7.8,12 7.8,4.9 4.1,0 4.1,7.1   '
                })
                ),

            el('path', {
                className: 'dbdb_st1',
                d: 'M21.3,16.2L21.3,16.2c0-1.5-0.3-2.8-0.7-3.9c-0.5-1.1-1.1-2.1-1.9-2.8c-0.8-0.7-1.6-1.3-2.5-1.7   c-0.9-0.4-1.8-0.6-2.6-0.6c-2.3,0-3.9,0.4-5,1.1l0,0.1v3.8L8.9,12c1.4-0.9,2.8-1.4,4.5-1.4c1.2,0.1,2.3,0.7,3.1,1.6   s1.2,2.1,1.2,3.6c0,0.3-0.1,0.5-0.1,0.7v0c0,0,0.2-0.2,0.2-0.2L21.3,16.2C21.2,16.2,21.3,16.3,21.3,16.2z',
            }),

            el('path', {
                className: 'dbdb_st2',
                d: 'M12.9,21.1c-1,0-2-0.3-2.7-0.8c-0.7-0.5-1.4-1.3-1.7-2.2c-0.2-0.5-0.4-1.1-0.5-1.6c-0.1-0.5-0.1-1-0.1-1.6   v-1.7L4.1,8.4v7.8c0,0.1,0.1,0.2,0.1,0.4c0.1,1,0.4,2,0.9,3.2c0.6,1.3,1.7,2.4,3,3.4c1.3,0.9,2.7,1.4,5,1.4v-3.4   C13.1,21.1,12.9,21.1,12.9,21.1z',
            }),

            el('path', {
                className: 'dbdb_st3',
                d: 'M12.9,24.4L12.9,24.4c1.5,0,2.7-0.3,3.8-0.8c1.1-0.5,1.9-1.2,2.6-2.1c0.6-0.8,1.1-1.9,1.4-2.8   c0.3-0.8,0.5-1.8,0.5-2.5h-3.5c-0.1,1.5-0.4,2.2-1,2.9c-0.6,0.7-1.1,1.3-1.8,1.6c-0.7,0.3-1.9,0.5-1.9,0.5v3.4   C13.1,24.5,12.8,24.4,12.9,24.4C12.9,24.4,12.9,24.4,12.9,24.4z',
            }),
            )
        );

    var glprops = {};
    function addImage(url){
        glprops.setAttributes({
            mediaURL: url,
        });
    }

    registerBlockType('designbold/design-button-block', {
        title: __('DesignBold'),
        description: __('A custom block for image design by DesignBold.'),
        icon: iconEl,
        category: 'common',
        keywords: [__('image'), __('photo'), __('pics')],
        attributes: { // Necessary for saving block content.
            mediaID: {
                type: 'number'
            },
            mediaURL: {
                type: 'string',
                source: 'attribute',
                selector: 'img',
                attribute: 'src'
            },
            mediaTitle: {
                type: 'string'
            },
            mediaFileName: {
                type: 'string'
            },
            alignment: {
                type: 'string',
                default: 'none',
            },
            content: {
                type: 'array',
                source: 'children',
                selector: 'p',
            }
        },

        edit: function (props) {
            glprops = props;
            var attributes = props.attributes,
            alignment = attributes.alignment,
            content = attributes.content,
            _content = [];

            /** Function to add value props */
            function startDesignTool() {
                DBSDK.startOverlay();
            };

            function onSelectImage(media) {
                props.setAttributes({
                    mediaURL: media.url,
                    mediaID: media.id,
                    mediaTitle: media.title,
                    mediaFileName: media.filename,
                })
            };

            function onChangeAlignment( newAlignment ) {
                props.setAttributes( { alignment: newAlignment === undefined ? 'none' : newAlignment } );
            }

            function onChangeContent( newContent ) {
                props.setAttributes( { content: newContent } );
            }

            var generateImage = (url) => {
                return [
                el(
                    BlockControls,
                    { key: 'controls' },
                    // Button upload images
                    el(Button, {
                        type: 'button',
                        className: 'dbdb-design-button',
                        onClick: startDesignTool,
                        children: iconEl
                    }),
                    el(
                        AlignmentToolbar,
                        {
                            value: alignment,
                            onChange: onChangeAlignment,
                        }
                        ),
                    ),

                el('figure', {className: 'wp-block-image is-resized'},
                    el('img', {src: url, resizeMethod: "scale"}),
                    el(
                        RichText,
                        {
                            key: 'richtext',
                            tagName: 'p',
                            style: { textAlign: alignment },
                            className: props.className,
                            onChange: onChangeContent,
                            value: content,
                            placeholder: __("Write caption..."),
                            keePlaceholderOnFocus: true,
                        }
                        )
                    )
                ]
            }

            /** End function to add value props */
            if (attributes.mediaURL) {
                _content.push(generateImage(props.attributes.mediaURL));
            } else {
                _content.push(
                    // Display controls when the block is clicked on.
                    el(
                        BlockControls,
                        { key: 'controls' },
                        // Button upload images
                        el(Button, {
                            type: 'button',
                            className: 'dbdb-design-button',
                            onClick: startDesignTool,
                            children: iconEl
                        }),
                        // Display alignment toolbar within block controls
                        el(
                            AlignmentToolbar,
                            {
                                value: alignment,
                                onChange: onChangeAlignment,
                            }),
                        ),

                    el('div', {className: props.className + ' components-placeholder editor-media-placeholder wp-block-image',},
                        el('div', {className: 'components-placeholder__label'},
                            el('svg',
                                {className: 'dashicon dashicons-format-image', width: '20', height: '20'},
                                el('path', {d: 'M2.25 1h15.5c.69 0 1.25.56 1.25 1.25v15.5c0 .69-.56 1.25-1.25 1.25H2.25C1.56 19 1 18.44 1 17.75V2.25C1 1.56 1.56 1 2.25 1zM17 17V3H3v14h14zM10 6c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm3 5s0-6 3-6v10c0 .55-.45 1-1 1H5c-.55 0-1-.45-1-1V8c2 0 3 4 3 4s1-3 3-3 3 2 3 2z'})
                                ),
                            __("DesignBold image")
                            ),

                        el('div', {className: 'components-placeholder__instructions'},
                            __("Drag an image, upload a new one or select a file from your library.")
                            ),

                        el('div', {className: 'components-placeholder__fieldset'},
                            el('div', {className: 'components-drop-zone'}),

                            el('div',
                                {className: 'components-form-file-upload'},
                                el('button',
                                {
                                    type: 'button',
                                    onClick: startDesignTool,
                                    className: 'components-button components-icon-button editor-media-placeholder__button is-button is-default is-large',
                                },
                                iconEl,
                                __("DesignBold")
                                ),
                                ),
                            el(MediaUpload, {
                                onSelect: onSelectImage,
                                allowedTypes: ALLOWED_MEDIA_TYPES,
                                type: 'button',
                                className: 'components-button editor-media-placeholder__button is-button is-default is-large',
                                value: attributes.mediaID,
                                render: function (obj) {
                                    return el(components.Button, {
                                        className: 'components-button editor-media-placeholder__button is-button is-default is-large',
                                        onClick: obj.open,
                                        children: __('Open Media Library')
                                    }
                                    )
                                }
                            })
                            )
                        )
                    )
            }

            return [_content];
        },

        save: function (props) {
            var attributes = props.attributes;
            return (
                el('div',
                    {className: props.className},
                    el('figure',
                        {className: 'wp-block-image'},
                        el('img', {src: attributes.mediaURL}),
                        el(RichText.Content, {
                            tagName: 'p',
                            value: props.attributes.content,
                            className: 'designbold-design-button-block-align-' + attributes.alignment,
                        })
                        )
                    )
                );
        },
    });

var callbackobject = {
    addImage : function(url){
        addImage(url);
    }
};
return callbackobject;
})(
window.wp.blocks,
window.wp.editor,
window.wp.components,
window.wp.i18n,
window.wp.element
);

