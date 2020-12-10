namespace $ {

	const { rem } = $mol_style_unit

	$mol_style_define( $mol_link , {
		
		textDecoration: 'none',
		color: $mol_theme.control,
		stroke: 'currentcolor',
		cursor: 'pointer',
		padding: $mol_gap.text,
		boxSizing: 'border-box',
		position: 'relative',
		minWidth: rem(2.5),

		':hover': {
			background: {
				color: $mol_theme.hover,
			},
		},

		':focus': {
			outline: 'none',
			background: {
				color: $mol_theme.hover,
			}
		},

		':focus-within': {
			outline: 'none',
			background: {
				color: $mol_theme.hover,
			}
		},

		'@': {
			mol_link_current: {
				'true': {
					background: {
						color: $mol_theme.back,
					},
					color: $mol_theme.text,
					textShadow: '0 0',
				}
			}
		},

	} )

}
