This is a slight adaptation of [Tom Van Cutsem's revocable membrane example](https://github.com/tvcutsem/harmony-reflect/blob/master/examples/membrane.js) (see solution 3), modified to use Proxy.revocable. This change means that revoking the membrane has the desired effect on garbage collection because all references between the dry and wet realms are severed on revokation.