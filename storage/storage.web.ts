namespace $ {
	export class $mol_storage extends $mol_object2 {
		
		@ $mol_mem
		static native() {
			return this.$.$mol_dom_context.navigator.storage
		}
		
		@ $mol_mem
		static persisted( next?: boolean, cache?: 'cache' ): boolean {
			
			$mol_mem_persist()
			
			if( cache ) return Boolean( next )
			
			const native = this.native()
			if( next && !$mol_mem_cached( ()=> this.persisted() ) ) {
				native.persist().then( actual => {
				
					setTimeout( ()=> this.persisted( actual, 'cache' ), 5000 )
					
					if( actual ) this.$.$mol_log3_rise({ place: this, message: `Persist` })
					else this.$.$mol_log3_fail({ place: this, message: `Non persist` })
					
				} )
			}
			
			return next ?? $mol_wire_sync( native ).persisted()
		}
		
		static estimate() {
			return $mol_wire_sync( this.native() ).estimate()
		}
		
		static dir() {
			return $mol_wire_sync( this.native() ).getDirectory()
		}
		
	}
}
