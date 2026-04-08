Event Flow Examples

1. Media Upload
user uploads file
-> media.uploaded
-> media.process.requested
-> ai.job.created
-> search.index.requested
-> notification.requested

2. Support Checkout
support submitted
-> payment.created
-> payment.completed
-> notification.requested
-> analytics event

3. Stream Start
stream.started
-> notification.requested
-> analytics event
-> holographic overlay status update
