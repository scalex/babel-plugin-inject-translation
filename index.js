var underscored = require('underscore.string').underscored;
var replaceExt = require('replace-ext');

var identifier = 'TRANSLATION_DOMAIN';

function pathToTranslation(filename, options) {
  var replacement = [process.cwd()];
  if (options.cwd) {
    replacement.push(options.cwd);
  } else {
    replacement.push('/');
  }

  var cwd = replacement.join('');
  var file = filename.split('!').pop();

  return underscored(replaceExt(file, '').replace(cwd, '').replace(/\//g, '.'));
}

module.exports = function(babel) {
  var t = babel.types;

  var injectTranslation = {
    enter: function(node, parent, scope, file) {
      var options = file.opts.extra.injectTranslation || {};

      var exists = function(item) {
        return t.isClassProperty(item) && item.key.name === identifier;
      };

      if (node.body.body.filter(exists).length === 0) {
        node.body.body.unshift({
          type: 'ClassProperty',
          key: {
            name: identifier,
            type: 'Identifier'
          },
          value: {
            value: pathToTranslation(file.opts.filename, options),
            type: 'Literal'
          },
          static: true,
          computed: false
        });
      }
    }
  };

  return new babel.Transformer('inject-translation', {
    ClassDeclaration: injectTranslation
  });
};
