'use client'
import { useState, useEffect } from 'react';
import { CldUploadButton } from 'next-cloudinary';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Image from 'next/image';
import Swal from 'sweetalert2'
import Link from 'next/link';

interface Form {
  model: string;
  category: string;
  image: string;
  price: string;
  spect: string;
  }

interface Errors {
  model: string;
  category: string;
  image: string;
  price: string;
  spect: string;
}


const validation = (form: Form, setErrors: React.Dispatch<React.SetStateAction<Errors>>) => {
  let newErrors: Errors = {
    model: form.model.trim() === '' ? 'Model cannot be empty' : '',
    image: form.image ? '' : "Upload an image",
    category: form.category ?  '' : 'Select a Category',
    price: Number(form.price) > 0 ? '' : 'Price must be a positive number',
    spect: form.spect ? '' : 'Spect must be a valid value',
  };
  setErrors(newErrors);
}

const CreateProduct: React.FC = () => {
  const [form, setForm] = useState<Form>({
    model: '',
    image: '',
    category: '',
     price: '',
    spect: '',
  });
  const [errors, setErrors] = useState<Errors>({
    model: '',
    image: '',
    category: '',
    price: '',
    spect: '',
  });
  const [formInteracted, setFormInteracted] = useState(false);
  const [alert, setAlert] = useState<React.ReactNode>(null);


  
useEffect(() => {
  console.log(form);
} , [form])




  const handleChange = (event: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const property = event.target.name;
    const value = event.target.value;

    setForm((prevForm) => ({
      ...prevForm,
      [property]: value,
    }));

    validation({ ...form, [property]: value }, setErrors);
    setFormInteracted(true);
  };


  const handleImageUpload = (data: any) => {
  
   const  {info} = data
    setForm((prevForm) => ({
          ...prevForm,
         image: info.secure_url,
        }))

      validation({ ...form, image: info.secure_url }, setErrors);
    setFormInteracted(true); 
   }


   const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    validation(form, setErrors);
  
    const hasErrors = Object.values(errors).some((error) => error !== '');
  
    if (!hasErrors) {
      try {
        let res = await fetch("/api/form", {
          method: "POST",
          body: JSON.stringify({ form }),
        }); 
  
        if (!res.ok) {
          throw new Error(res.statusText);
        }
  
        const resetForm = () =>
          setForm({
            model: '',
            image: "",
            category: '',
            price: '',
            spect: '',
          });
        resetForm();
        
        Swal.fire({
          title: "Product added successfully!",
          icon: "success",
          html: <Link href="/products"><a>Go to products</a></Link>, 
          showCloseButton: true,
          showCancelButton: true,
          focusConfirm: false,
          confirmButtonText: `
            <i class="fa fa-thumbs-up"></i> Great!
          `,
          confirmButtonAriaLabel: "Thumbs up, great!",
          
        });
        
        
      } catch (error) {
        console.error(error);
        Swal.fire({
          title: "Error!",
          text: "Product not added",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } else {
      console.log(errors);
      Swal.fire({
        title: "Error!",
        text: 'Please correct the information',
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  
  useEffect(() => {
    AOS.init();
  }, []);

 return (
  <>
    <div className="flex flex-col sm:flex-row justify-center bg-gray-500 w-full mb-96">
      
      <div className="m-6  mx-4 w-auto sm:mx-10 sm:w-2/3 p-4 bg-black rounded-md shadow-md items-center gap-5 mb-50 text-gray-300 ">
        <h1 data-aos="flip-right" className="text-2xl text-gray-400 p-20 text-center">New Product</h1>
        <form onSubmit={handleFormSubmit} className="grid justify-items-center content-evenly gap-y-20">
          <div data-aos="flip-right" className='flex flex-col items-center gap-8 w-full'>
            <label htmlFor="model">Name model:</label> 
            <input
              name="model"
              type="text"
              id="model"
              value={form.model}
              onChange={handleChange}
              className=' text-4x1 text-black p-2 w-full border-gray-500 rounded '
            />  
          </div>
          <div data-aos="flip-right" className='flex justify-center w-full'>
            <CldUploadButton 
              className='w-full border-blue-500 text-normal rounded border-2 p-8 cursor-pointer transition duration-300 hover:bg-blue-500 hover:text-white hover:border-transparent'
              uploadPreset="zwtk1tj5"
              onUpload={handleImageUpload}
            >
              Upload Image
            </CldUploadButton>
          </div>
          {form.image && (
            <div className="flex justify-center w-full">
              <Image 
                src={form.image}
                alt='imagen' 
                width={400}
                height={400}
                className="w-full h-auto transition-transform hover:scale-110" 
                data-aos="flip-right" 
              />
            </div>
          )}
          <div data-aos="flip-right" className='flex flex-col items-center w-full'>
            <label htmlFor="category">Category:</label>
            <select
              name="category"
              id="category"
              value={form.category}
              onChange={handleChange}
              className='text-3xl text-black w-full border-blue-500'  
            >
              <option value="All">All</option>
              <option value="Phones">Phones</option>
              <option value="Tablets">Tablets</option>
              <option value="Laptops">Laptops</option>
              <option value="Desktops">Desktops</option>
              <option value="Softwares">Softwares</option>
            </select>
          </div>
          <div data-aos="flip-right" className='flex flex-col items-center gap-2 w-full'>
            <label htmlFor="price">Price:</label>
            <input
              name="price"
              type="text"
              id="price"
              value={form.price}
              onChange={handleChange}
              className='m-1 text-2xl text-black p-2 w-full  border-gray-500 rounded border-blue-500'
            />
          </div>
          <div data-aos="flip-right" className='flex flex-col items-center gap-2 w-full'>
            <label htmlFor="spect">Spect</label>
            <input
              name="spect"
              type="text"
              id="spect"
              value={form.spect}
              onChange={handleChange}
              className='m-1 text-2xl text-black p-2 w-full border-gray-500 rounded border-blue-500'
            />
          </div>
          <div data-aos="flip-right" className="bg-blue-500 text-black p-10 justify-center rounded-md cursor-pointer transition duration-500 hover:bg-white hover:text-blue-500 w-full">
            <button 
              type="submit"
              disabled={ Object.values(errors).some((error) => error !== '')}
              className='border-gray-500 w-full rounded '
            >
              {!form.model || Object.values(errors).some((error) => error !== '') ? 'Cannot Submit - Fix Errors' : 'Add New Product'}
            </button>
          </div>
        </form>
      </div>
      <div className="w-full sm:w-2/4 mx-auto p-5 bg-gray-300 shadow-md text-black">
    {/* Columna lateral */}
    {formInteracted ? (
      Object.values(errors).some((error) => error !== '') ? (
        <div className="sticky top-12  h-auto p-12 text-sm text-gray-400 md:tw-1/2 tw-1/4 mx-auto p-15 bg-black rounded-md shadow-md ">
         <p>Please correct the following requirements:</p>
          <ul className='sticky top-12 h-auto ' >
            {Object.entries(errors).map(([key, value]) => (
              <li className= "p-5" key={key}>

                <span className=" rounded-md shadow-md "> {value ?  "❌ "  + value :  "✅ " + key.charAt(0).toUpperCase() + key.slice(1) + ' has been successfully validated' }  </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="sticky top-12  h-auto text-sm  md:tw-1/2 tw-1/4 mx-auto p-8 bg-black rounded-md shadow-md text-gray-400 ">

          <ul>
            {Object.entries(errors).map(([key, value]) => (
              <li className="p-5" key={key}>
                <span className="text-gray-400">✅ {key.charAt(0).toUpperCase() + key.slice(1)} has been successfully validated </span>
              </li>
            ))}
          </ul> 
            <div className="text-gray-200 p-5  text-sm rounded-full "> ✅
           <b>Your product is ready to be loaded!</b></div>
          </div>
      )
    ) : (
      <div className="sticky top-12  h-auto text-base text-gray-400 md:tw-1/2 tw-1/4 mx-auto p-5 bg-black rounded-md shadow-md ">
        <p>Requirements:</p>
        <ul>
          <li className='p-5 '>
            <span className="text-blue-500 ">Name model</span>  Model cannot be empty 
          </li>
          <li className='p-5 '>
            <span className="text-blue-500">Image</span> Upload an image 
          </li>
          <li className='p-5 '>
            <span className="text-blue-500">Category</span> Select a Category
          </li>
          <li className='p-5 '>
            <span className="text-blue-500">Price </span> must be a positive number
          </li>
          <li className='p-5 '>  
            <span className="text-blue-500">Spect</span> must be a valid Spect
          </li>
              
        </ul>

      </div>
    )}
     {form.image ? (
            <div className="fixed right-16 bottom-4  ">
              <Image 
                src={form.image}
                alt='imagen' 
                width={150}
                height={100}
                className="h-full transition-transform hover:scale-110 sm:opacity-10 opacity-0 z-negative pointer-events-none"
              />
            </div>): <div> </div> }
  </div>

        
</div>

  </>
);

};

export default CreateProduct;