import TransferForm from '@/components/TransferForm'

function DomesticTransfer() {
  return (
    <section className='flex flex-col scroll-smooth min-h-screen pb-10 lg:pt-0 p-4 lg:p-8 pt-20 md:pt-0'>
        <TransferForm 
  type="domestic"
/>
    </section>
  )
}

export default DomesticTransfer