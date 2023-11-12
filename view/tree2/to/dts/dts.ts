namespace $ {
	const err = $mol_view_tree2_error_str

	function name_of(this: $, prop: $mol_tree2) {
		const name = prop.type
			? this.$mol_view_tree2_prop_parts(prop).name
			: prop.value

		if (! name) {
			this.$mol_fail(
				err`Required valid prop name at ${prop.span}`
			)
		}

		return prop.data(name)
	}
	
	function params_of( this: $, prop: $mol_tree2, ... val: $mol_tree2[] ) {
		
		const { name, key, next } = this.$mol_view_tree2_prop_parts(prop)

		if (next && (! val.length || ! val[0].value) ) {
			this.$mol_fail(
				err`Type empty for next value at ${prop.span}`
			)
		}

		return prop.struct( 'line', [
			prop.data(name),
			prop.data('( '),
			... key ? [
				prop.data( 'id: any' + (next ? ', ' : '') ),
			] : [],
			... next ? [
				prop.data( 'next?: ' ),
				... val,
			] : [],
			prop.data(' )'),
		] )
		
	}

	function return_type_raw(this: $, klass: $mol_tree2, input: $mol_tree2) {
		return [
			input.data( 'ReturnType< ' ),
			klass,
			input.data( '["' ),
			input,
			input.data( '"] >' ),
		]
	}

	function return_type(this: $, klass: $mol_tree2, input: $mol_tree2) {
		return return_type_raw.call(this, klass.data( klass.type ), name_of.call(this,  input ))
	}

	function bind_res( this: $, klass: $mol_tree2, bind: $mol_tree2 ) {
		const child = this.$mol_view_tree2_child(bind)

		return return_type.call(this, klass, child)
	}

	function primitive_type(input: $mol_tree2) {
		let type = 'string'
		if (input.type && (
			input.type.match(/[\+\-]*NaN/)
			|| !Number.isNaN( Number( input.type ) )
		)) type = 'number'

		if (input.type === 'true' || input.type === 'false') type = 'boolean'

		return input.data(type)
	}

	function readonly_arr(this: $, input: $mol_tree2, infered: readonly $mol_tree2[]) {
		return infered.length === 1 ? [
			input.data('readonly( '),
			infered[0],
			input.data(' )[]'),
		] : [
			input.data('readonly('),
			input.struct( 'indent', infered),
			input.data(')[]'),
		]
	}

	function type_enforce(this: $, name: $mol_tree2, a: readonly $mol_tree2[], b: readonly $mol_tree2[]) {
		return name.struct('line', [
			name.data(`type ${ name.value }__${ this.$mol_guid() } = $mol_type_enforce<` ),
			name.struct( 'indent', [
				a[0].struct('line', a),
				a[0].data(','),
				b[0].struct('line', b),
			]),
			name.data( '>' ),
		])
	}

	export function $mol_view_tree2_to_dts(this: $, tree: $mol_tree2) {
		
		const descr = $mol_view_tree2_classes( tree )
		
		const types = [] as $mol_tree2[]
		
		for( const klass of descr.kids ) {
			
			const parent = this.$mol_view_tree2_child(klass)
			const props = this.$mol_view_tree2_class_props(klass)
			const aliases = [] as $mol_tree2[]
			const context = { objects: [] as $mol_tree2[] }
			const br = bind_res.bind(this, klass)
			const rt = return_type.bind(this, klass)

			types.push(
				klass.struct( 'line', [
					klass.data( 'export class ' ),
					klass.data( klass.type ),
					parent.data( ' extends ' ),
					parent.data( parent.type ),
					klass.data( ' {' ),
				] ),
				... props.map( prop => {
					
					const val = prop.hack({
						
						'null': ( val, belt )=> val.kids[0]?.value ? [ val.kids[0], val.data( ' | null' ) ]: [ val.data( 'any' ) ],
						
						'true': ( val, belt )=> [ val.data( 'boolean' ) ],
						'false': ( val, belt )=> [ val.data( 'boolean' ) ],
						
						'@': ( locale, belt )=> locale.hack( belt ),
						
						'<=>': br,
						'<=': br,
						'=>': br,
						'^': (input) => return_type.call(
								this,
								input.kids.length ? klass : parent,
								input.kids.length ? input.kids[0] : prop
						),
						'': ( input, belt, context )=> {

							if (input.type[0] === '*') {
								let unions = [] as $mol_tree2[]

								const hacked = ( [] as readonly $mol_tree2[] ).concat(
									... input.kids.map( kid => {
										if (kid.type[0] === '^') {
											unions = unions.concat(kid.data(' & '), kid.hack_self(belt, context))
											return []
										}

										const child = this.$mol_view_tree2_child(kid)
										const ret = child.hack_self( belt )

										return kid.struct( 'line', kid.type.match(/(?:\*|\?)/)
											? [
												params_of.call(this, kid, ...ret),
												kid.data(': '),
												...ret,
												kid.data( ',' ),
											]
											: [
												kid.data('\''),
												kid.data( kid.type || kid.value ),
												kid.data('\': '),
												...ret,
												kid.data( ',' ),
											],
										)
									} )
								)

								if (input.type.length > 1 || ! hacked.length) {
									return [
										input.data('Record<string, '),
										input.data(input.type.slice(1) || 'any'),
										input.data('>'),
										... unions
									]
								}

								return [
									input.data('({ '),
									input.struct( 'indent', hacked),
									input.data('}) '),
									... unions
								]

							}

							if( input.type[0] === '/' ) {
								const dups = new Set<string>()
								const infered = ( [] as readonly $mol_tree2[] ).concat(
									... input.kids.map( (kid, index) => {
										const result = kid.hack_self(belt, context) as $mol_tree2[]
										const val = result[0].value
										if (val === 'number' || val === 'string' || val === 'boolean') {
											if (dups.has(val)) return []
											dups.add(val)
										}

										if (index !== 0) result.unshift(kid.data('| '))
										if (kid.type[0] === '^') result.push((kid.kids[0] ?? prop).data('[number]'))

										return kid.struct('line', result)
									} )
								)

								const array_type = input.type.length > 1 ? input.data(input.type.slice(1)) : undefined

								if (infered.length && array_type) {
									types.push(
										type_enforce.call(
											this,
											input.data(`${ klass.type }_${prop.type.replace(/[\?\*]*/g, '')}`),
											readonly_arr.call(this, input, infered),
											readonly_arr.call(this, input, [ array_type ]),
										)
									)
								}

								const result = array_type || ! infered.length
									? [ array_type ?? input.data('any') ]
									: infered
		
								return readonly_arr.call(this, input, result)
							}

							if( input.type !== 'NaN' && /^[$A-Z]/.test( input.type ) ) {
								const first = input.kids[0]
								if( first?.type[0] === '/' ) {
									
									types.push(
										type_enforce.call(
											this,
											first.data(`${ input.type }`),
											[
												first.data('[ '),
												... first.hack( belt ),
												first.data( ' ]' ),
											],
											[
												input.data( `ConstructorParameters< typeof `),
												input.data(input.type),
												input.data(` >`),
											],
										),
									)
									
								} else for( const over of input.kids ) {
									
									const name = name_of.call(this,  over )
									const bind = this.$mol_view_tree2_child(over)
									
									if( bind.type === '=>' ) {
										
										const pr = bind.kids[0]
										
										const res = return_type_raw.call(
											this,
											klass.data( input.type ),
											name,
										)

										aliases.push(
											pr.struct( 'indent', [
												pr.struct( 'line', [
													params_of.call(this, pr, ... res ),
													bind.data( ': ' ),
													... res,
												] ),
											] ),
										)
									}
										
									types.push(
										type_enforce.call(
											this,
											over.data(`${ input.type }__${ name.value }`),
											over.hack( belt ),
											return_type.call(
												this,
												input,
												over,
											),
										)
									)
								}
								
								return [
									input.data( input.type ),
								]
								
							}
							
							return [
								primitive_type(input)
							]
							
						},
						
					}, context)
	
					return prop.struct( 'indent', [
						prop.struct( 'line', [
							params_of.call(this, prop, ... val ), // Parameter, not Return
							prop.data(': '),
							... val,
						] )
					] )
					
				} ).filter($mol_guard_defined),
				... aliases,
				klass.data( '}' ),
				descr.data(''),
			)
			
		}

		return descr.list([
			descr.data( 'declare namespace $ {' ),
			descr.data( '' ),
			descr.struct( 'indent', types ),
			descr.data( '}' ),
		])
		
	}
}
