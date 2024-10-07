namespace $ {

	export function $mol_exec(
		this : $ ,
		cwd : string ,
		command : string ,
		...args : readonly string[]
	) {
		return this.$mol_run( { command: [ command, ...args ], dir: cwd } )
	}
}
