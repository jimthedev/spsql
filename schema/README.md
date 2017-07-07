## Errors

In prod errors are dunpted to the console and not reflected.

In dev, errors are dumped to the console and reflected.

There is work still to be done as to when prod errors will end up
in the proper environment log store.

## Notes

### Stage 0: Wrap existing APIs

Currently we are wrapping api calls instead of bringing in db calls which means

- [x] Use Mocked Identity Service from Assortment Catalog Gateway
- [ ] Swap out Mocked Identity Service to use actual SPS ID SVC
- [x] FormPresets Service (Fully implemented)
- [ ] Assortment Catalog Gateway
- [ ] Add some concept of environments

### Stage 1: Swap out with direct connection to data store

Eventually we can [take advantage of joinmonster](http://join-monster.readthedocs.io/en/latest/pagination/) or other technologies to reduce the number of joins performed since we know exactly which fields are being requested.

- [ ] direct db connection w/knex or other query builder
- [ ] [joinmonster](https://github.com/acarl005/join-monster-graphql-tools-adapter)

### Stage 2: Offer ad hoc querying via field lt, gt, in filters.
