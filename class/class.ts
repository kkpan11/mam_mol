namespace $ {

	console.warn( '$mol_class is deprecated. Do not use it.' )

	export function $mol_class< Class extends  any >( Class : Class ) {
		
		// Class[ Symbol.toStringTag ] = Class.name
		
		// if( !Class.prototype.hasOwnProperty( Symbol.toStringTag ) ) {
		// 	Class.prototype[ Symbol.toStringTag ] = Class.name
		// }

		return Class

	}

}
