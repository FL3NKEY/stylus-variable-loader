# stylus-variable-loader

This is an experimental thing, be careful.

## Usage

``` stylus
//vars.styl
$size = 12px;
$padding = 10px 12px;
$color = #FFF;
$expr-color = alpha($color, 0.5);
$button = {
	$color: white,
	$background: black,
	$font-size: 1.2em
}
```

``` js
//vars.js
import variables from '!!stylus-variable-loader!./path-to/vars.styl';

console.log(variables);

{
    '$size': '12px',
    '$padding': '10px 12px',
    '$color': '#FFF',
    '$expr-color': 'rgba(255, 255, 255, 0.5)',
    '$button': {
        '$color': 'white',
        '$background': 'black',
        '$font-size': '1.2em'
    }
}

```